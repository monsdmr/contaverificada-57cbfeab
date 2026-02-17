
## Corrigir flickering na pagina /resgatar

### Problema identificado
Os logs do console mostram warnings de "Function components cannot be given refs" para:
1. `RedeemRewards` - porque `React.lazy()` tenta passar ref ao componente
2. `CountdownHeader` - porque `memo()` sem `forwardRef` gera warning de ref

Esses warnings combinados com `Suspense` podem causar remontagens inesperadas do componente.

### Solucao

**Arquivo: `src/pages/RedeemRewards.tsx`**
- Remover `memo` do `CountdownHeader` (nao e necessario pois ja e um componente isolado, e causa o warning de ref)
- Adicionar `forwardRef` no export default do `RedeemRewards` para compatibilidade com `React.lazy()`

**Arquivo: `src/App.tsx`**
- Melhorar o fallback do `Suspense` para que a transicao durante lazy loading seja menos perceptivel (evita flash branco)

### Detalhes tecnicos

```text
CountdownHeader: memo() -> componente simples (sem memo)
RedeemRewards: export default -> forwardRef wrapping
Suspense fallback: div vazio -> loading spinner ou skeleton
```

Essas mudancas eliminam os warnings de ref e reduzem o efeito visual de "sumir e aparecer" durante recargas do modulo.
