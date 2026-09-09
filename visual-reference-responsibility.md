# Responsabilidad de la referencia visual

## 1. Identificación

- **Proyecto:** Portfolio profesional de Félix Márquez
- **Documento:** `visual-reference-responsibility.md`
- **Fecha:** 2026-09-09
- **Referencia principal:** REF-01 — `content/hero-reference.png`
- **Referencias complementarias:** NINGUNA
- **Estado:** APROBADO por la instrucción explícita del usuario

## 2. Función de la referencia

La referencia visual se utilizará exclusivamente para orientar la composición, jerarquía y atmósfera de la sección hero. No constituye una instrucción para copiar la pieza completa ni reemplaza el contenido, la identidad personal, la imagen de Félix Márquez, los requisitos funcionales o las restricciones técnicas.

## 3. Fuentes de decisión y precedencia

1. Contenido literal de `content/home-portfolio-felix-marquez-copy.md`.
2. Instrucción de diseñar un portfolio profesional inspirado en el estilo del proyecto `sysmapps`.
3. Accesibilidad, responsive y arquitectura técnica del proyecto Astro.
4. Autoridad concedida a REF-01 en este documento.
5. Criterio contextual de diseño.

## 4. Autoridad directa

| ID            | Rasgo observado                                                          | Alcance                 | Criterio                                                                          |
| ------------- | ------------------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------- |
| CE-04 / CE-05 | Hero editorial asimétrico: mensaje a la izquierda y retrato a la derecha | Solo hero en escritorio | Ambos focos mantienen peso visual equilibrado                                     |
| JV-01 / JV-02 | Titular como primer foco, de gran escala y varias líneas                 | Titular principal       | Es el elemento tipográfico dominante                                              |
| ID-03 / ID-10 | Retrato protagonista integrado al fondo oscuro                           | Imagen real de Félix    | La fotografía pertenece al proyecto y se integra sin parecer una tarjeta genérica |

## 5. Autoridad adaptada

| ID            | Principio                                                    | Adaptación                                                                                       |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| LV-01 / LV-06 | Carácter sobrio, técnico y preciso                           | Traducido al lenguaje visual oscuro y cromático de `sysmapps`                                    |
| CT-01 / CT-07 | Tema oscuro con acento funcional                             | Se utilizan azul eléctrico y cian del contexto del proyecto, no colores medidos de la referencia |
| RE-02 / RE-06 | Primer bloque amplio con espacio negativo                    | Se adapta al contenido real, más extenso, y al mapa de producto                                  |
| TP-04 / TP-13 | Titular sans serif de gran escala, compacto y multilineal    | Se compone con el texto literal del portfolio                                                    |
| CP-02         | CTA principal sólida y secundaria contenida                  | Se aplican los CTA literales del contenido                                                       |
| PE-03 / PE-07 | Relación cercana entre texto e imagen y hero de alto impacto | Se recompone según el retrato suministrado y cada breakpoint                                     |

## 6. Autoridad inspiracional

| ID            | Cualidad permitida                                       | Lo que no exige                                 |
| ------------- | -------------------------------------------------------- | ----------------------------------------------- |
| LV-02         | Percepción profesional y premium por control compositivo | No exige copiar marca, fuente o valores exactos |
| LP-08 / LP-09 | Profundidad atmosférica y contraste focal sutil          | No exige reproducir la iluminación exacta       |

## 7. Aspectos excluidos

- Textos, monograma, enlaces, navegación y activos concretos de la referencia.
- Identidad, fotografía, paleta exacta y tipografía exacta de la referencia.
- Copia literal de proporciones, medidas o detalles circunstanciales.
- Extensión de la referencia a secciones distintas del hero.

## 8. Dominios sin autoridad

- **Contenido y orden semántico:** los decide el Markdown aprobado.
- **Resto de la página:** lo decide el contenido y el lenguaje del proyecto `sysmapps`.
- **Responsive:** NO OBSERVABLE en una única captura; lo decide la implementación.
- **Movimiento e interacción:** NO OBSERVABLE; lo deciden accesibilidad y criterio técnico.
- **Metadatos, formulario y navegación:** los deciden los requisitos del proyecto.

## 9. Protección del contenido y la marca

- El texto, significado, jerarquía y orden argumental deben conservarse.
- La imagen autorizada del hero es `src/assets/images/home/felix-marquez-image.webp`.
- No se inventarán proyectos, métricas, clientes, testimonios ni datos personales.
- Los valores pendientes permanecerán visibles como placeholders hasta ser confirmados.

## 10. Validación

- La referencia solo es reconocible en los principios compositivos del hero.
- El retrato, contenido e identidad pertenecen a Félix Márquez.
- La experiencia responsive no depende de inferencias de la captura.
- No se copiaron activos, textos ni elementos de marca de REF-01.
