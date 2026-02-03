declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/* prettier-ignore */
declare module 'vue' {
  export interface GlobalComponents {
    ElAutocomplete: typeof import('element-plus/es')['ElAutocomplete']
    ElButton: typeof import('element-plus/es')['ElButton']
    ElCard: typeof import('element-plus/es')['ElCard']
    ElInput: typeof import('element-plus/es')['ElInput']
    ElLink: typeof import('element-plus/es')['ElLink']
    ElText: typeof import('element-plus/es')['ElText']
  }
}
