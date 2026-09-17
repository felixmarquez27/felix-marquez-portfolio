---
layout: ../layouts/MarkdownPostLayout.astro
title: "Por qué usar TanStack Query para gestionar el estado del servidor"
seo_title: "TanStack Query: caché, sincronización y estado del servidor en React"
description: "Descubre por qué TanStack Query simplifica el consumo de APIs en React mediante caché, sincronización, mutaciones e invalidación de datos."
excerpt: "Hacer un fetch es fácil. Lo difícil es mantener la interfaz sincronizada con datos remotos que pueden cambiar en cualquier momento."
slug: "por-que-usar-tanstack-query"
author: "Félix Márquez"
pubDate: "2026-09-17"
date: "2026-09-17"
cover: "por-que-usar-tanstack-query/cover-blog.webp"
tags:
  - React
  - TanStack Query
  - Frontend
  - Arquitectura de software
  - Estado del servidor
hero_alt: "Diagrama de una aplicación React conectada a una API mediante la caché de TanStack Query"
hero_image_brief: "Ilustración dark tech corporate. Una aplicación React a la izquierda, una API a la derecha y una capa central de caché identificada como TanStack Query. Flechas de sincronización, estados pending, success y error, fondo negro y acentos azul eléctrico. Sin personas ni texto decorativo adicional."
---

Hacer una petición HTTP desde React es sencillo. El verdadero problema comienza después.

¿Cuándo deben volver a consultarse los datos? ¿Qué ocurre si dos componentes necesitan la misma información? ¿Cómo evitamos mostrar contenido obsoleto? ¿Qué consulta debemos actualizar después de una mutación? ¿Cómo mantenemos una interfaz ágil sin crear una capa de estado difícil de sostener?

TanStack Query está diseñada para resolver ese conjunto de problemas. No es solamente una función más cómoda para ejecutar `fetch`. Es una capa especializada en obtener, almacenar temporalmente, sincronizar y actualizar **estado del servidor** dentro de una aplicación web.

Ese enfoque reduce código accidental y permite que el equipo dedique más atención al producto.

## El problema no es obtener los datos

Una implementación básica puede comenzar así:

```tsx
useEffect(() => {
  fetch('/api/projects')
    .then((response) => response.json())
    .then(setProjects)
}, [])
```

El código funciona, pero todavía no resuelve varias preguntas:

- ¿Dónde se representa el estado de carga?
- ¿Cómo se maneja el error?
- ¿Qué sucede si el componente se desmonta durante la petición?
- ¿Cómo se reutilizan los datos desde otra pantalla?
- ¿Cuándo se consideran obsoletos?
- ¿Cómo se actualizan después de crear o editar un proyecto?
- ¿Qué pasa cuando el usuario pierde y recupera la conexión?

Cuando estas decisiones se resuelven manualmente en cada componente, la aplicación empieza a acumular lógica repetida. TanStack Query aporta un modelo común para tratar ese comportamiento.

## Estado local y estado del servidor no son lo mismo

Una de las ideas más importantes es separar dos tipos de estado.

| Estado local o de cliente | Estado del servidor |
| --- | --- |
| Pertenece a la interfaz | Está almacenado fuera de la aplicación |
| La aplicación controla su valor | Puede cambiar sin que la interfaz lo sepa |
| Suele ser síncrono | Se obtiene mediante operaciones asíncronas |
| Ejemplo: modal abierto | Ejemplo: listado de proyectos |
| Ejemplo: tema visual | Ejemplo: datos del usuario |
| Ejemplo: paso de un formulario | Ejemplo: estado de una orden |

Zustand, Redux o Context pueden ser buenas herramientas para estado de cliente. Sin embargo, el estado remoto tiene problemas adicionales: latencia, caché, obsolescencia, concurrencia, reintentos y sincronización.

TanStack Query no pretende reemplazar todo el estado de la aplicación. Su especialidad es el estado que proviene del servidor.

## El modelo mental de TanStack Query

Una consulta se construye alrededor de dos elementos:

- `queryKey`: identifica los datos dentro de la caché.
- `queryFn`: devuelve la promesa que obtiene esos datos.

```tsx
import { useQuery } from '@tanstack/react-query'

function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects')

      if (!response.ok) {
        throw new Error('No fue posible obtener los proyectos')
      }

      return response.json()
    },
  })
}
```

La `queryKey` no es una etiqueta decorativa. Es la identidad de la consulta. TanStack Query la utiliza para almacenar datos, compartir resultados, volver a consultar información e invalidar entradas concretas.

Si una función depende de una variable, esa variable debe formar parte de la clave:

```tsx
function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId),
  })
}
```

De esta forma, cada proyecto ocupa una entrada independiente en la caché.

## Configuración inicial

En React, el punto de partida es crear un `QueryClient` y compartirlo mediante `QueryClientProvider`.

```tsx
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Esta configuración no debería copiarse de forma automática entre proyectos. `staleTime`, reintentos y comportamiento de actualización deben responder a la naturaleza de los datos.

Un catálogo que cambia pocas veces puede tolerar varios minutos de frescura. El estado de una operación crítica puede necesitar una estrategia mucho más estricta.

## 1. Una caché diseñada para datos remotos

Cuando una consulta se completa, su resultado se asocia con la `queryKey`. Si otro componente solicita la misma información, TanStack Query puede reutilizar el dato disponible y decidir si corresponde actualizarlo.

Esto permite evitar dos extremos frecuentes:

- solicitar todo nuevamente en cada montaje;
- conservar datos indefinidamente sin comprobar si continúan vigentes.

TanStack Query distingue entre datos **fresh** y **stale**. La opción `staleTime` determina cuánto tiempo una consulta se considera fresca. Después de ese periodo, puede volver a consultarse en determinados eventos, como un nuevo montaje, el regreso a la ventana o la recuperación de la conexión.

Un detalle importante: de forma predeterminada, las consultas se consideran obsoletas inmediatamente. Esto no significa que la caché desaparezca; significa que la librería puede revalidar esos datos cuando se cumplan sus condiciones de actualización.

## 2. Estados asíncronos explícitos

`useQuery` expone estados que permiten representar el ciclo de vida de la información:

```tsx
function Projects() {
  const {
    data,
    error,
    isPending,
    isError,
    isFetching,
  } = useProjects()

  if (isPending) return <ProjectsSkeleton />
  if (isError) return <ErrorMessage error={error} />

  return (
    <section>
      {isFetching && <small>Actualizando…</small>}
      <ProjectList projects={data} />
    </section>
  )
}
```

`isPending` indica que todavía no existe información disponible. `isFetching` informa que la función de consulta está ejecutándose, incluso si la interfaz ya tiene datos y solamente se realiza una actualización en segundo plano.

Esta diferencia evita reemplazar contenido útil por una pantalla de carga cada vez que la aplicación revalida información.

## 3. Sincronización en segundo plano

Una aplicación puede mostrar datos desde la caché y, al mismo tiempo, comprobar si existe una versión más reciente en el servidor. Este patrón mejora la percepción de velocidad sin renunciar a la actualización.

Entre los comportamientos configurables se encuentran:

- actualización al montar una nueva instancia;
- actualización al recuperar el foco de la ventana;
- actualización al restablecerse la conexión;
- consultas periódicas mediante intervalos;
- reintentos frente a fallos temporales.

No todos los datos necesitan las mismas reglas. El valor de TanStack Query no está solamente en automatizar, sino en centralizar esas decisiones de manera declarativa.

## 4. Mutaciones e invalidación dirigida

Las consultas leen datos. Las mutaciones crean, modifican o eliminan información en el servidor.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['projects'],
      })
    },
  })
}
```

Cuando la operación termina correctamente, la consulta `['projects']` se marca como obsoleta. Si está activa, TanStack Query puede actualizarla en segundo plano.

Este enfoque evita mantener manualmente múltiples copias del mismo dato. La invalidación también puede ser más específica:

```tsx
queryClient.invalidateQueries({
  queryKey: ['projects', projectId],
})
```

La calidad de las claves determina la precisión de estas actualizaciones. Una estrategia de claves improvisada suele terminar en invalidaciones demasiado amplias.

## 5. Una mejor experiencia de usuario

TanStack Query proporciona herramientas para mejorar la interacción sin ocultar la complejidad real:

- `placeholderData` permite mantener una referencia visual mientras cambia una página o filtro;
- `prefetchQuery` puede preparar información antes de la navegación;
- las actualizaciones optimistas reflejan un cambio antes de recibir la confirmación del servidor;
- la caché evita pantallas vacías cuando los datos ya estuvieron disponibles;
- `isFetching` permite comunicar una actualización sin bloquear la pantalla completa.

Las actualizaciones optimistas son potentes, pero exigen una estrategia de reversión. No deberían utilizarse por defecto en operaciones sensibles o difíciles de deshacer.

## Cómo organizar TanStack Query en un proyecto real

En proyectos medianos o grandes, conviene evitar consultas dispersas directamente en las pantallas. Una estructura posible es:

```text
src/
├── features/
│   └── projects/
│       ├── api/
│       │   ├── create-project.ts
│       │   └── get-projects.ts
│       ├── hooks/
│       │   ├── use-create-project.ts
│       │   └── use-projects.ts
│       └── query-keys.ts
└── providers/
    └── query-provider.tsx
```

También es útil centralizar la construcción de claves:

```tsx
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: ProjectFilters) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (projectId: string) =>
    [...projectKeys.details(), projectId] as const,
}
```

Este patrón aporta consistencia y permite invalidar desde categorías generales hasta recursos específicos.

## Errores frecuentes

### Usarla para todo el estado de la interfaz

El estado de un modal, una pestaña activa o un formulario local no necesita convertirse en una consulta. TanStack Query debe conservar un límite claro: estado asíncrono que pertenece al servidor.

### Ignorar los valores predeterminados

Si no se comprende `staleTime`, una aplicación puede realizar más actualizaciones de las esperadas. Configurar `refetchOnWindowFocus: false` globalmente puede ocultar el síntoma, pero no sustituye una política de frescura bien definida.

### Construir claves incompletas

Si una consulta depende de filtros, página, organización o usuario, esos valores deben participar en la clave. De lo contrario, datos diferentes pueden competir por la misma entrada de caché.

### Invalidar toda la caché

`queryClient.invalidateQueries()` sin filtros puede ser válido en casos excepcionales, pero utilizarlo como solución habitual elimina buena parte de la precisión que ofrece la librería.

### Aplicar optimismo sin reversión

Una actualización optimista debe definir qué ocurre cuando el servidor rechaza la operación. La velocidad percibida no debe producir una interfaz incoherente.

### Confundir caché con persistencia permanente

La caché vive en memoria de forma predeterminada. Persistirla entre sesiones requiere una estrategia adicional y no convierte al cliente en la fuente de verdad.

## ¿Cuándo es una buena decisión?

TanStack Query suele aportar valor cuando:

- varias pantallas consumen una API;
- diferentes componentes necesitan los mismos recursos;
- existen listados, filtros, paginación o detalles relacionados;
- las mutaciones deben actualizar consultas específicas;
- se necesita controlar la frescura de los datos;
- la experiencia mejora con precarga o revalidación en segundo plano;
- el equipo quiere un criterio común para el estado remoto.

Puede ser innecesaria cuando la aplicación realiza una única petición estática, el framework ya cubre completamente el caso de uso o no existe interacción relevante con estado remoto en el cliente.

## TanStack Query no elimina las decisiones de arquitectura

La librería resuelve mecanismos, pero no decide:

- qué datos pertenecen al servidor;
- qué política de frescura requiere cada dominio;
- cómo se nombran y organizan las claves;
- qué errores deben reintentarse;
- qué mutaciones permiten optimismo;
- qué información puede almacenarse en el cliente;
- cómo se integran la autenticación y la autorización.

Adoptarla sin estas reglas puede trasladar el desorden a una herramienta más sofisticada. Adoptarla con criterios claros crea una capa de datos predecible y escalable.

## Conclusión

TanStack Query es una buena idea cuando la interfaz depende de datos remotos que deben permanecer coordinados con el servidor.

Su valor no está en ahorrar una llamada a `fetch`. Está en formalizar el ciclo completo del estado remoto: identidad, caché, frescura, carga, error, actualización, mutación e invalidación.

El resultado es menos lógica repetida, componentes con responsabilidades más claras y una experiencia de usuario que puede mantenerse ágil incluso cuando la aplicación crece.

La pregunta no es si TanStack Query puede realizar una petición. La pregunta es cuánto código y cuántas decisiones manuales necesita tu aplicación para mantener esa petición correctamente sincronizada.

## Preguntas frecuentes

### ¿TanStack Query reemplaza Redux o Zustand?

No de forma general. TanStack Query se especializa en estado del servidor. Redux o Zustand pueden seguir gestionando estado local o flujos de cliente que no pertenecen a una API.

### ¿TanStack Query incluye un cliente HTTP?

No. Puede trabajar con `fetch`, Axios, GraphQL u otra función que devuelva una promesa. La librería administra el ciclo de los datos, no el transporte HTTP.

### ¿La caché evita todas las nuevas peticiones?

No. La reutilización y la actualización dependen de opciones como `staleTime`, del estado de la consulta y de eventos configurados. El objetivo no es impedir solicitudes, sino realizarlas con una política coherente.

### ¿Debo utilizar actualizaciones optimistas en todas las mutaciones?

No. Son adecuadas cuando la operación es predecible y puede revertirse. En acciones críticas puede ser preferible esperar la confirmación del servidor.

### ¿Funciona solamente con React?

TanStack Query dispone de adaptadores para diferentes frameworks. Los ejemplos de este artículo utilizan `@tanstack/react-query` porque están orientados a aplicaciones React.

## Fuentes oficiales

- [TanStack Query: Overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Query: Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries)
- [TanStack Query: Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [TanStack Query: Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query: Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- [TanStack Query: Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [TanStack Query: Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

---

Autor: [Félix Márquez](https://felixmarquez.dev) — Desarrollo full stack, arquitectura y construcción de productos digitales.
