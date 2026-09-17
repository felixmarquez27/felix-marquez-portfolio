---
layout: ../layouts/MarkdownPostLayout.astro
title: "Module Federation: cómo se integran los microfrontends en el navegador"
seo_title: "Module Federation 2.0: arquitectura, host, remotes y dependencias compartidas"
description: "Guía conceptual sobre Module Federation 2.0: host, remotes, mf-manifest.json, carga diferida, dependencias compartidas y monorepos."
excerpt: "Module Federation permite que aplicaciones independientes compartan y carguen módulos en tiempo de ejecución. La integración ocurre en el navegador, pero la arquitectura sigue siendo responsabilidad del equipo."
slug: "module-federation-microfrontends-en-el-navegador"
author: "Félix Márquez"
pubDate: "2026-09-17"
date: "2026-09-17"
cover: "module-federation-microfrontends-en-el-navegador/cover-blog.webp"
tags:
  - Module Federation
  - Microfrontends
  - React
  - Frontend
  - Arquitectura de software
hero_alt: "Microfrontends independientes integrándose dentro de una aplicación web mediante Module Federation"
hero_image_brief: "Ilustración dark tech corporate. A la izquierda, tres aplicaciones independientes desplegadas en servidores separados: navegación, catálogo y checkout. En el centro, un archivo mf-manifest.json y líneas de conexión. A la derecha, una ventana de navegador que integra los tres módulos. Fondo negro, acentos azul eléctrico, diagramas limpios, sin personas."
---

Dividir un frontend en varios repositorios no crea automáticamente una arquitectura de microfrontends. La separación se vuelve relevante cuando diferentes partes del producto pueden desarrollarse, probarse, desplegarse y evolucionar con un grado real de autonomía.

Después aparece el problema central: ¿cómo se integran esas aplicaciones para que el usuario perciba una sola experiencia?

Module Federation proporciona un mecanismo para compartir y cargar módulos entre aplicaciones JavaScript. En lugar de reconstruir todo el frontend cada vez que cambia una parte, una aplicación principal puede descubrir módulos remotos y cargarlos en tiempo de ejecución.

La composición ocurre en el navegador. La arquitectura, sin embargo, sigue dependiendo de decisiones humanas: límites funcionales, contratos, versiones, disponibilidad y responsabilidades de cada equipo.

## Qué es Module Federation

Module Federation es una solución de carga y distribución de módulos entre aplicaciones independientes. Se introdujo originalmente en Webpack 5 y su ecosistema actual amplía el modelo mediante un runtime desacoplado, manifiestos, tipos remotos, plugins e integraciones con diferentes herramientas de construcción.

En una arquitectura típica:

- una aplicación actúa como **host** o **shell**;
- otras aplicaciones actúan como **remotes** o proveedores;
- cada remote expone componentes, páginas o funciones;
- el host consume esos módulos cuando los necesita;
- algunas dependencias pueden compartirse para evitar copias incompatibles.

Module Federation es una referencia ampliamente adoptada para microfrontends, pero no es un estándar formal del navegador. Es una solución de arquitectura y runtime construida sobre el ecosistema JavaScript.

## Qué problema resuelve

Sin federación, integrar módulos de equipos diferentes suele exigir alguna de estas estrategias:

- publicar cada módulo como un paquete y reconstruir la aplicación consumidora;
- integrar todo el código dentro de un único proceso de compilación;
- utilizar iframes con límites de experiencia y comunicación más marcados;
- construir un cargador personalizado para scripts remotos;
- desplegar todas las partes de forma coordinada.

Module Federation permite que un módulo se publique de manera independiente y que otro sistema lo cargue en runtime. Esto reduce el acoplamiento del ciclo de entrega, aunque no elimina la necesidad de contratos compatibles.

## Las piezas principales

### Host o shell

El host es la aplicación que coordina la experiencia general. Normalmente controla:

- el layout principal;
- la navegación global;
- la inicialización del runtime;
- la resolución de remotes;
- los estados de carga y error;
- algunos servicios transversales, como autenticación o telemetría.

El shell no debería convertirse en un nuevo monolito que concentre toda la lógica del producto. Su responsabilidad es integrar capacidades y establecer límites comunes.

### Remotes

Los remotes son aplicaciones o módulos que exponen funcionalidades consumibles. Un remote puede representar:

- una página completa;
- un dominio del producto, como checkout o facturación;
- un conjunto de componentes;
- una función utilitaria;
- una aplicación React completa.

La unidad correcta no depende del tamaño del archivo, sino del límite funcional y organizacional que se desea proteger.

### Exposes

`exposes` declara qué módulos publica un remote.

```ts
import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin'

export default createModuleFederationConfig({
  name: 'checkout',
  exposes: {
    './App': './src/App.tsx',
    './CheckoutButton': './src/components/CheckoutButton.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
})
```

El nombre expuesto funciona como parte del contrato. Cambiarlo sin una política de compatibilidad puede romper a los consumidores.

### Remotes

La configuración `remotes` permite que el host conozca a los proveedores que puede consumir.

```ts
import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin'

export default createModuleFederationConfig({
  name: 'shell',
  remotes: {
    checkout: 'checkout@https://checkout.example.com/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
})
```

El host no recibe necesariamente el código completo durante su propia compilación. Recibe la información necesaria para localizar y resolver el remote cuando la aplicación se ejecuta.

## Cómo se une todo en el navegador

El flujo conceptual puede resumirse así:

1. Cada microfrontend se construye y despliega como una unidad independiente.
2. El remote publica sus artefactos y un punto de entrada o manifiesto.
3. El host conoce la URL del remote mediante su configuración o registro dinámico.
4. El runtime consulta `mf-manifest.json` o el punto de entrada correspondiente.
5. El manifiesto describe los recursos, módulos expuestos y metadatos necesarios.
6. Cuando una ruta o funcionalidad requiere el módulo, el runtime descarga los recursos.
7. El navegador ejecuta el módulo remoto dentro de la aplicación host.
8. El usuario percibe una experiencia integrada.

El manifiesto no contiene toda la aplicación. Funciona como un mapa para que el runtime encuentre los artefactos correctos.

## Carga diferida desde el shell

Un remote no necesita cargarse al iniciar toda la aplicación. Puede solicitarse cuando el usuario entra en una ruta o activa una funcionalidad.

```tsx
import { lazy, Suspense } from 'react'

const Checkout = lazy(() => import('checkout/App'))

export function CheckoutRoute() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <Checkout />
    </Suspense>
  )
}
```

Este patrón permite mantener separado el ciclo de entrega y controlar cuándo se paga el costo de red del módulo.

La carga diferida no debe confundirse con ausencia de estrategia. Un remote crítico puede necesitar precarga, manejo de timeouts, fallback y observabilidad para evitar que un fallo externo deje una zona vacía en la interfaz.

## Module Federation 2.0

Module Federation 2.0 amplía la idea original más allá de una característica ligada exclusivamente a Webpack.

Entre sus capacidades se encuentran:

- runtime desacoplado de la herramienta de build;
- protocolo basado en `mf-manifest.json`;
- registro y carga dinámica de remotes;
- generación y consumo de tipos remotos;
- plugins y hooks del runtime;
- herramientas de depuración y visualización de dependencias;
- optimizaciones para dependencias compartidas;
- soporte ampliado para SSR y escenarios de Node.js.

El cambio conceptual más importante es que la federación deja de depender por completo de una única herramienta de compilación. El runtime puede registrar y cargar módulos de forma dinámica, mientras los plugins de build mejoran la integración y la experiencia de desarrollo.

## Herramientas compatibles

El ecosistema actual incluye integraciones para diferentes categorías:

| Categoría | Herramientas |
| --- | --- |
| Bundlers | Webpack, Rspack, Rollup, Rolldown |
| Build tools | Rsbuild, Vite, Metro |
| Frameworks y herramientas | Modern.js, Next.js, Rspress, Rslib, Storybook |
| Librerías de interfaz | React, Vue, React Native |

La integración concreta depende del stack. Algunos paquetes habituales son:

- `@module-federation/enhanced` para Webpack y Rspack;
- `@module-federation/rsbuild-plugin` para Rsbuild;
- `@module-federation/vite` para Vite;
- `@module-federation/nextjs-mf` para la integración documentada con Next.js y Webpack.

No conviene asumir que todos los plugins de Webpack funcionan automáticamente en cualquier bundler. La arquitectura debe validarse con la combinación exacta de framework, runtime y herramienta de construcción.

## Dependencias compartidas e instancias únicas

Si cada microfrontend incluye su propia copia de React, React DOM o una librería de diseño, el navegador puede descargar código duplicado. En algunos casos también pueden aparecer errores por tener instancias incompatibles dentro de la misma experiencia.

La opción `shared` permite declarar dependencias reutilizables:

```ts
shared: {
  react: {
    singleton: true,
    requiredVersion: '^19.0.0',
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^19.0.0',
  },
}
```

`singleton: true` indica que se debe utilizar una sola versión de la dependencia dentro del share scope correspondiente. Esto es especialmente importante para librerías que esperan una única instancia.

Sin embargo, compartir todo tampoco es una buena estrategia. Cada dependencia compartida introduce negociación de versiones y acoplamiento entre aplicaciones.

Conviene evaluar:

- tamaño de la dependencia;
- frecuencia de uso;
- compatibilidad entre versiones;
- necesidad real de una instancia única;
- costo de cargarla de forma independiente;
- impacto de una actualización sobre otros equipos.

Compartir dependencias es una decisión de arquitectura, no una optimización automática.

## Tipos remotos y contratos

Una debilidad histórica de los módulos remotos era perder seguridad de tipos entre productores y consumidores. El ecosistema actual puede generar y distribuir declaraciones TypeScript para los módulos expuestos.

Esto mejora la experiencia de desarrollo, pero los tipos no sustituyen otros contratos:

- comportamiento esperado;
- compatibilidad semántica;
- eventos emitidos;
- permisos requeridos;
- estados de error;
- política de deprecación;
- expectativas visuales.

Un tipo válido garantiza que la forma del dato coincide. No garantiza que el cambio sea seguro para el negocio.

## Module Federation y monorepos

Module Federation y un monorepo resuelven problemas diferentes.

| Module Federation | Monorepo |
| --- | --- |
| Compone módulos en runtime | Organiza código y paquetes en un repositorio |
| Permite carga remota | Coordina tareas de desarrollo y build |
| Facilita despliegues independientes | Facilita cambios atómicos entre paquetes |
| Gestiona remotes y dependencias compartidas | Gestiona pipelines, caché y dependencias internas |

Se pueden utilizar juntos. Por ejemplo, **Turborepo** o **Nx** pueden organizar las aplicaciones y paquetes, mientras Module Federation se ocupa de la composición cuando el sistema se ejecuta.

Es importante no confundir **Turborepo** con **Turbopack**:

- Turborepo es una herramienta para gestionar monorepos y pipelines de tareas.
- Turbopack es un bundler incremental integrado en Next.js.

Utilizar un monorepo tampoco obliga a desplegar todos los microfrontends juntos. Esa decisión depende del pipeline y de la estrategia de entrega.

## El despliegue es parte de la arquitectura

La independencia de los remotes introduce nuevas responsabilidades operativas.

### Versionado y compatibilidad

Un remote puede cambiar sin que el host se reconstruya. Por eso deben existir reglas de compatibilidad, ventanas de deprecación y capacidad de reversión.

### Caché y CDN

Los artefactos con hash pueden almacenarse durante mucho tiempo, mientras el manifiesto necesita una política que permita descubrir versiones nuevas sin servir referencias obsoletas.

### Disponibilidad

Si un remote no responde, el shell debe decidir qué mostrar. Las funcionalidades críticas necesitan fallback, límites de tiempo y observabilidad.

### Seguridad

Cargar código remoto exige controlar orígenes, políticas de contenido, integridad del pipeline, permisos y procedencia de los artefactos.

### Observabilidad

Los errores deben poder asociarse con una versión concreta del host y del remote. Sin esta trazabilidad, diagnosticar una falla distribuida se vuelve costoso.

## Decisiones que Module Federation no toma por el equipo

La herramienta no define automáticamente:

- dónde termina un dominio funcional;
- qué equipo es responsable de cada módulo;
- cómo se comparte la autenticación;
- cómo se coordinan navegación y rutas;
- cómo se aíslan estilos;
- cómo se comunican los microfrontends;
- qué dependencias son globales;
- qué ocurre si un remote falla;
- cómo se prueban contratos entre versiones.

Una mala separación organizacional no mejora por agregar carga remota. Puede convertirse en un monolito distribuido: más despliegues, más red y más puntos de fallo, pero el mismo acoplamiento.

## Patrones de comunicación

Los microfrontends necesitan intercambiar información, pero deben evitar depender directamente de los detalles internos de otros módulos.

Algunas opciones son:

- propiedades y callbacks para componentes pequeños;
- eventos del navegador con contratos explícitos;
- servicios compartidos muy controlados;
- estado ubicado en el shell cuando realmente es global;
- navegación mediante URLs como contrato;
- APIs de backend como fuente común de verdad.

El objetivo no es eliminar toda comunicación. Es evitar que un remote necesite conocer la implementación interna de otro.

## Cuándo tiene sentido

Module Federation puede ser una buena decisión cuando:

- varios equipos trabajan sobre dominios claramente separados;
- se necesitan ciclos de despliegue independientes;
- existe una aplicación grande con límites funcionales identificables;
- se quiere migrar un frontend de forma progresiva;
- hay componentes o capacidades que deben consumirse en runtime;
- la organización puede sostener contratos, observabilidad y gobierno técnico.

## Cuándo puede ser complejidad innecesaria

Probablemente no sea la primera opción cuando:

- un solo equipo controla todo el frontend;
- el producto todavía cambia de dirección constantemente;
- no existen límites de dominio claros;
- todos los módulos se publicarán siempre juntos;
- la infraestructura no puede observar múltiples despliegues;
- el problema real puede resolverse con paquetes internos y un build común.

La arquitectura debe responder al tamaño del problema actual, no solamente a una expectativa futura de escala.

## Errores frecuentes

### Dividir por componentes visuales

Separar Header, Sidebar y Button como aplicaciones independientes suele aumentar el acoplamiento. Los límites de negocio tienden a ser más estables que los límites puramente visuales.

### Compartir demasiadas dependencias

Una lista extensa de paquetes compartidos convierte la negociación de versiones en una dependencia organizacional difícil de controlar.

### No diseñar fallbacks

Los remotes son recursos de red. Deben asumirse latencia, indisponibilidad y errores de carga.

### Confundir repositorio con arquitectura de runtime

Un monorepo puede contener una aplicación monolítica. Varios repositorios pueden desplegarse como un solo frontend. La estructura del código y la composición en ejecución son dimensiones distintas.

### Ignorar el versionado de contratos

Desplegar de forma independiente sin compatibilidad convierte cada publicación en un riesgo para todo el producto.

## Checklist antes de adoptar Module Federation

- [ ] Existen dominios funcionales claros.
- [ ] Cada módulo tiene un equipo responsable.
- [ ] La independencia de despliegue produce un beneficio real.
- [ ] Los contratos entre host y remotes están documentados.
- [ ] Las dependencias compartidas tienen política de versiones.
- [ ] Cada remote posee fallback y manejo de errores.
- [ ] El pipeline permite rollback independiente.
- [ ] La observabilidad identifica host, remote y versión.
- [ ] La estrategia de caché distingue manifiestos y artefactos versionados.
- [ ] Se prueban integraciones entre versiones compatibles.

## Conclusión

Module Federation permite que aplicaciones independientes se encuentren y colaboren en tiempo de ejecución. El shell descubre los remotes, consulta sus manifiestos y carga los módulos cuando la experiencia los necesita.

Eso resuelve el mecanismo de integración. No resuelve por sí solo la arquitectura.

Una implementación madura necesita límites funcionales, contratos, compatibilidad, fallbacks, observabilidad y una estrategia de despliegue coherente. Cuando esas condiciones existen, Module Federation puede dar autonomía a los equipos sin fragmentar la experiencia del usuario.

La pregunta correcta no es solamente si es posible dividir el frontend. Es si la organización tiene una razón suficiente y la capacidad técnica para operar esas partes como un sistema distribuido.

## Preguntas frecuentes

### ¿Module Federation es un estándar web?

No es un estándar formal del navegador. Es una solución del ecosistema JavaScript para compartir y cargar módulos entre aplicaciones, con integraciones para diferentes bundlers y herramientas.

### ¿Todos los microfrontends deben utilizar React?

No necesariamente. El ecosistema admite diferentes tecnologías, aunque mezclar frameworks aumenta las decisiones de integración, estilos, routing y experiencia de usuario.

### ¿El host descarga todos los remotes al iniciar?

No es obligatorio. Los módulos pueden cargarse de forma diferida o precargarse según la importancia de la ruta y la estrategia de rendimiento.

### ¿`singleton: true` garantiza que nunca habrá conflictos?

No. Ayuda a utilizar una única versión dentro del share scope, pero las restricciones de versiones y la compatibilidad deben configurarse y controlarse.

### ¿Necesito un monorepo para utilizar Module Federation?

No. Puede utilizarse en un monorepo o en repositorios separados. El monorepo organiza el desarrollo; Module Federation resuelve la composición en runtime.

### ¿Turbopack administra el monorepo?

No. Turbopack es un bundler de Next.js. Para la gestión de monorepos se utilizan herramientas como Turborepo o Nx.

## Fuentes oficiales

- [Module Federation: documentación principal](https://module-federation.io/)
- [Module Federation 2.0 Stable Release](https://module-federation.io/blog/v2-stable-version.html)
- [Module Federation: Quick Start](https://module-federation.io/guide/start/quick-start)
- [Module Federation: Runtime Access](https://module-federation.io/guide/runtime/)
- [Module Federation: Integrations](https://module-federation.io/integrations/)
- [Module Federation: Shared dependencies](https://module-federation.io/configure/shared)
- [Module Federation: Type Hinting](https://module-federation.io/guide/basic/type-prompt.html)
- [Next.js: Turbopack](https://nextjs.org/docs/app/api-reference/turbopack)
- [Turborepo](https://turborepo.com/)

---

Autor: [Félix Márquez](https://felixmarquez.dev) — Desarrollo full stack, arquitectura y construcción de productos digitales.
