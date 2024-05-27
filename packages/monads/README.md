# monads-ts

`monads-ts` es una biblioteca de monadas y utilidades para la programación funcional en TypeScript. Proporciona implementaciones de varias monadas comunes y utilidades para trabajar con ellas.

## Contenido

- [Monadas incluidas](#monadas-incluidas)
- [Cómo usar](#cómo-usar)
- [Documentación](#documentación)
- [Instalación](#instalación)
- [Pruebas](#pruebas)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Monadas incluidas

- `Task`: Una monada para manejar efectos secundarios asíncronos.
- `TaskEither`: Una monada que combina `Task` y `Either` para manejar efectos secundarios asíncronos y errores.
- `State`: Una monada que encapsula una transformación de estado.
- `Maybe`: Una monada que puede representar un valor que puede existir o no.
- `IO`: Una monada para manejar efectos secundarios.
- `Either`: Una monada que puede representar un valor que puede ser de uno de dos tipos.

Además, la biblioteca proporciona la interfaz `Functor` que puede ser implementada por cualquier objeto que pueda ser mapeado.

## Cómo usar

Cada monada se exporta como una clase con varios métodos estáticos y de instancia para trabajar con ella. Aquí hay un ejemplo de cómo se podría usar la monada `Maybe`:

```typescript
import { Maybe } from 'monads-ts';

const maybeValue = Maybe.of(5);
const mappedValue = maybeValue.map(x => x * 2);
console.log(mappedValue.get()); // 10
```

## Documentación
Para más detalles sobre cómo usar cada monada y qué métodos están disponibles, consulte los comentarios en el código fuente de cada archivo.

## Instalación
Para instalar monads-ts, ejecuta el siguiente comando en tu terminal:
    
```bash
npm install monads-ts
```

## Pruebas
Para ejecutar las pruebas de monads-ts, ejecuta el siguiente comando en tu terminal:

```bash
npm test
```

## Contribuir
Las contribuciones son bienvenidas. Por favor, abra un problema o una solicitud de extracción si tiene alguna sugerencia o mejora. Para contribuir, sigue estos pasos:

1. Crea un fork del repositorio.
2. Crea una rama con tu característica: `git checkout -b mi-caracteristica`.
3. Realiza tus cambios y haz commit de ellos: `git commit -m 'Añade mi característica'`.
4. Haz push a la rama: `git push origin mi-caracteristica`.

## Licencia
Este proyecto está licenciado bajo la Licencia Apache 2.0. Consulta el archivo [LICENSE](LICENSE) para más detalles.