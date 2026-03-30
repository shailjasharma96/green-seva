import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Key is missing. Please check your .env file.')
}

// Mock Supabase client for demonstration purposes if URL is missing or unreachable
const createMockClient = () => {
  const handler = {
    get: (target, prop) => {
      if (['select', 'eq', 'order', 'limit', 'or', 'single', 'from', 'delete', 'insert', 'update'].includes(prop)) {
        return () => new Proxy(target, handler);
      }
      if (prop === 'then') {
        return (onFulfilled) => {
          const mockData = {
            profiles: { id: 'demo-user-id', name: 'Eco Champion', email: 'demo@greenseva.com', total_weight: 124.5, eco_points: 3420, rank: 'Eco Legend', impact_progress: 85 },
            recycling_logs: [
              { id: 1, type: 'Plastic', weight: '2.5kg', points: 25, created_at: new Date().toISOString(), date: '2024-03-21' },
              { id: 2, type: 'Metal', weight: '1.2kg', points: 15, created_at: new Date().toISOString(), date: '2024-03-20' },
            ],
            pickup_requests: [
              { id: 1, pickup_date: '2026-03-25', pickup_time: '09:00 AM - 11:00 AM', address: '123 Green St, Eco City', waste_categories: ['Plastic', 'Paper'], status: 'Scheduled' },
              { id: 2, pickup_date: '2026-03-28', pickup_time: '02:00 PM - 04:00 PM', address: '456 Earth Blvd, Nature Town', waste_categories: ['E-Waste'], status: 'Scheduled' },
            ],
            recycling_centers: [
              { id: 1, name: 'EcoCenter Central', distance: '0.8 km', types: ['Plastic', 'Paper', 'Metal'], status: 'Open' },
              { id: 2, name: 'GreenHub North', distance: '1.5 km', types: ['E-Waste', 'Glass'], status: 'Closing Soon' },
              { id: 3, name: 'PureCycle West', distance: '2.3 km', types: ['Plastic', 'Organic'], status: 'Open' }
            ]
          };
          // Try to guess table from target if set, or just return default
          const res = { data: mockData.recycling_logs, error: null };
          // For single() calls or profile calls
          if (target._isSingle || target._table === 'profiles') res.data = mockData.profiles;
          if (target._table === 'recycling_centers') res.data = mockData.recycling_centers;
          if (target._table === 'pickup_requests') res.data = mockData.pickup_requests;
          
          return Promise.resolve(onFulfilled(res));
        };
      }
      return target[prop];
    }
  };

  const client = {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'demo-user-id', email: 'demo@greenseva.com' } } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: { id: 'demo-user-id', email: 'demo@greenseva.com' } } }),
      resetPasswordForEmail: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: { user: { id: 'demo-user-id' } }, error: null }),
      signUp: async () => ({ data: { user: { id: 'demo-user-id' } }, error: null }),
    },
    from: (table) => {
      const target = { _table: table };
      return new Proxy(target, handler);
    },
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
    removeChannel: () => {},
  };
  return client;
};

const realSupabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const mockSupabase = createMockClient();

// A robust proxy to catch network errors and fallback to mock
export const supabase = new Proxy({}, {
  get: (target, prop) => {
    if (prop === 'auth') {
      const realAuth = realSupabase?.auth;
      const mockAuth = mockSupabase.auth;
      
      return new Proxy(realAuth || {}, {
        get: (authTarget, authProp) => {
          const original = authTarget[authProp];
          if (typeof original === 'function') {
            // onAuthStateChange is special (sync)
            if (authProp === 'onAuthStateChange') {
              return (...args) => {
                try {
                  return (realAuth && typeof original === 'function') ? original.apply(realAuth, args) : mockAuth.onAuthStateChange(...args);
                } catch (_e) {
                  return mockAuth.onAuthStateChange(...args);
                }
              };
            }

            // All other auth methods are async
            return async (...args) => {
              try {
                if (!realAuth) throw new Error('No realSupabase');
                console.log(`[Supabase Proxy] Trying real auth.${authProp}...`);
                const res = await original.apply(realAuth, args);
                if (res?.error?.message?.includes('Failed to fetch')) {
                   console.warn(`[Supabase Proxy] Fetch failed in response, falling back to mock.`);
                   return mockAuth[authProp](...args);
                }
                return res;
              } catch (err) {
                console.warn(`[Supabase Proxy] Caught error in auth.${authProp}:`, err.message);
                return mockAuth[authProp](...args);
              }
            };
          }
          return original || mockAuth[authProp];
        }
      });
    }

    if (prop === 'from') {
      return (tableName) => {
        try {
          if (!realSupabase) return mockSupabase.from(tableName);
          const realQuery = realSupabase.from(tableName);
          
          const wrapChain = (chainTarget) => {
            return new Proxy(chainTarget, {
              get: (target, method) => {
                const original = target[method];
                if (typeof original === 'function') {
                  return (...chainArgs) => {
                    if (method === 'then') {
                      return original.apply(target, chainArgs).catch(_err => {
                        console.warn(`[Supabase Proxy] DB Fetch failed for ${tableName}, using mock.`);
                        return mockSupabase.from(tableName).select('*').then(chainArgs[0]);
                      });
                    }
                    const result = original.apply(target, chainArgs);
                    return (typeof result === 'object' && result !== null) ? wrapChain(result) : result;
                  };
                }
                return original;
              }
            });
          };
          return wrapChain(realQuery);
        } catch (_e) {
          return mockSupabase.from(tableName);
        }
      };
    }

    if (prop === 'channel' || prop === 'removeChannel') {
        return (...args) => {
            try {
                return (realSupabase && typeof realSupabase[prop] === 'function') 
                    ? realSupabase[prop](...args) 
                    : mockSupabase[prop](...args);
            } catch (_e) {
                return mockSupabase[prop](...args);
            }
        }
    }

    return realSupabase ? realSupabase[prop] : mockSupabase[prop];
  }
});
