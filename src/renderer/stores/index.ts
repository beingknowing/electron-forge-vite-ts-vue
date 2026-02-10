
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(createPersistedState({
    key: key => `my-app-${key}`,
    storage: window.localStorage,
    afterHydrate: () => { }

}))

export default pinia