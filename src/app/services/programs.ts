/**
 * Servicio de **programas**.
 *
 * Un servicio es una clase que guarda algo que no es de una sola pantalla. Acá
 * lo que se guarda es *saber hablar con la base de datos*. Este es el ÚNICO
 * archivo del proyecto que menciona Firestore: las pantallas piden `Program[]`
 * y no tienen idea de dónde sale. El día que la base cambie, se cambia acá.
 *
 * Todo lo que el servicio necesita está adentro de la clase: el nombre de la
 * colección, la conexión y los tres métodos. Nada suelto en el archivo.
 */

// `Service` es el decorador que le avisa a Angular que esta clase se puede
// inyectar. Equivale a `@Injectable({ providedIn: 'root' })`, que es como se
// escribía antes: una sola instancia para toda la aplicación.
// `inject` es la función que pide una dependencia sin pasarla por el constructor.
import { PendingTasks, Service, TransferState, inject, makeStateKey } from '@angular/core';

// Del SDK de Firebase se traen solo las funciones que se usan. No se importa
// «Firestore entero»: lo que no se nombra acá no viaja en el paquete que se
// descarga el navegador.
import { DocumentData, collection, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';

// El token con la conexión ya inicializada. Lo crea `provideFirebase(...)` en
// `app.config.ts`, una sola vez para toda la aplicación.
import { FIRESTORE } from './firebase';

// El modelo. Vive en `domain/` y no sabe que existen ni Angular ni Firebase.
import { Program } from '../domain/program';

@Service()
export class Programs {
  /**
   * La conexión con Firestore.
   *
   * `private` — solo la usa esta clase. `readonly` — se asigna una vez y nadie
   * la puede reemplazar después. `inject(FIRESTORE)` pide lo que se registró en
   * `app.config.ts`; acá no se inicializa Firebase ni se conocen las claves.
   */
  private readonly db = inject(FIRESTORE);

  /**
   * El nombre de la colección.
   *
   * Es un dato de este servicio, así que es un campo de este servicio. Escrito
   * una vez: si mañana la colección se llama distinto, se cambia esta línea.
   */
  private readonly collection = 'programs';

  /**
   * El puente entre el servidor y el navegador.
   *
   * Angular serializa lo que se guarde acá dentro del propio HTML. Sin esto, el
   * servidor pide el catálogo a Firestore, dibuja las tarjetas, y el navegador
   * vuelve a pedir lo mismo al hidratar: dos lecturas cobradas por la misma
   * lista, y un parpadeo mientras llega la segunda.
   */
  private readonly state = inject(TransferState);

  /** La llave con la que se guarda y se recupera esa lista. */
  private readonly cacheKey = makeStateKey<Program[]>('programs');

  /**
   * El registro de tareas pendientes.
   *
   * Angular no sabe que hay una promesa a Firestore en curso, así que al
   * renderizar en el servidor da la página por terminada antes de que llegue la
   * respuesta y manda el HTML con el «Cargando…» dentro. Envolver la lectura
   * acá es la manera de decirle: todavía no.
   */
  private readonly pending = inject(PendingTasks);

  /**
   * El catálogo que ya vino dentro del HTML, si vino.
   *
   * Se lee de forma **síncrona**, y esa es toda la gracia: el componente puede
   * arrancar con los datos ya puestos y dibujar en el navegador exactamente lo
   * mismo que llegó por la red. Si el primer dibujado no coincide con el HTML
   * recibido, Angular descarta esa parte y la rehace, que es el parpadeo que se
   * quería evitar.
   *
   * Se consume una sola vez: a partir de ahí los datos se piden a la red.
   */
  transferred(): Program[] {
    const stored = this.state.get(this.cacheKey, [] as Program[]);
    if (stored.length) this.state.remove(this.cacheKey);
    return stored;
  }

  /**
   * Todos los programas activos, ordenados por nombre.
   *
   * Es `async` porque hablar con la red toma tiempo: la función devuelve una
   * PROMESA en el momento, y la lista cuando Google contesta. Quien la llama
   * escribe `await this.programs.all()`.
   */
  async all(): Promise<Program[]> {
    // Una sola promesa con dos interesados: quien llamó, que espera la lista, y
    // Angular, que la registra como tarea pendiente y por eso no da la página
    // por terminada antes de tiempo. `run` no devuelve el valor —solo avisa—,
    // así que la promesa se guarda y se devuelve aparte.
    const reading = this.read();
    this.pending.run(() => reading);
    return reading;
  }

  /** La lectura propiamente dicha. Privada: afuera solo existe `all()`. */
  private async read(): Promise<Program[]> {
    // `collection(...)` todavía no lee nada: arma la dirección de la colección,
    // como escribir una dirección en un sobre. La red no se toca acá.
    const target = collection(this.db, this.collection);

    // `query(...)` le agrega condiciones a esa dirección. `orderBy('name')`
    // ordena EN LOS SERVIDORES de Google, no en el navegador: llega ordenado y
    // no hay que recorrer la lista de nuevo.
    const ordered = query(target, orderBy('name'));

    // `try` porque esto sale a internet, y todo lo que sale a internet falla
    // alguna vez: sin señal, con las reglas cerradas, con el proyecto pausado.
    try {
      // Acá SÍ se va a la red. `await` detiene esta función —no la página—
      // hasta que llega la respuesta.
      const snapshot = await getDocs(ordered);

      // `snapshot` no es la lista: es la foto de la respuesta. Los documentos
      // están en `snapshot.docs`, y cada uno trae su nombre por un lado (`id`) y
      // sus campos por otro (`.data()`).
      const programs = snapshot.docs
        // De cada documento sale un `Program`. Armarlo está en un solo método,
        // abajo, para no repetirlo en cada lugar que lea.
        .map((document) => this.toProgram(document.id, document.data()))
        // Un programa viejo no se borra: se apaga. Acá se dejan fuera los
        // apagados, y por eso el catálogo no muestra lo que ya no se oferta.
        .filter((program) => program.active);

      // Se deja la lista dentro del HTML. En el navegador esta línea no hace
      // nada visible; en el servidor es lo que evita la segunda lectura.
      this.state.set(this.cacheKey, programs);

      return programs;
    } catch (error) {
      // El error se escribe con su causa probable al lado. A quien programa le
      // sirve más «¿las reglas permiten leer?» que un código de Firebase.
      console.error('[programs] Firestore no respondió al leer.', error);

      // Y se devuelve una lista vacía. La pantalla ya sabe dibujar «no hay
      // programas»; no hace falta enseñarle además a dibujar «se rompió».
      return [];
    }
  }

  /**
   * Uno solo, por el `slug` que viene en la URL (`/programa/auditoria-financiera`).
   *
   * Se lee la colección entera y se busca en memoria. Parece derrochador y no lo
   * es: son siete programas y la ficha casi siempre se abre desde el catálogo,
   * que ya los pidió. Una segunda consulta sería pagar dos lecturas a Google
   * para ahorrarse un `find`.
   */
  async bySlug(slug: string): Promise<Program | undefined> {
    // Se reutiliza el método de arriba. Si mañana cambia cómo se lee, cambia en
    // un solo lugar.
    const programs = await this.all();

    // `find` devuelve el primero que cumple, o `undefined` si no hay ninguno.
    // Ese `undefined` no es un error: es un enlace viejo o un programa retirado,
    // y quien decide qué mostrar es la pantalla (un 404).
    return programs.find((program) => program.slug === slug);
  }

  /**
   * Crear un programa.
   *
   * **No se llama desde el constructor de un componente.** Se llama desde una
   * acción: un botón, el envío de un formulario. Un constructor corre en el
   * servidor, otra vez en el navegador al hidratar, y otra vez más por cada ruta
   * que `ng build` prerenderiza: serían tres escrituras por un clic que nadie dio.
   */
  async create(program: Program): Promise<void> {
    // `doc(...)` apunta a UN documento, y su tercer argumento es el nombre que
    // le ponemos nosotros. Ese nombre ES el identificador.
    const target = doc(this.db, this.collection, program.id);

    try {
      // **`setDoc` y no `addDoc`.** `addDoc` deja que Firestore invente el
      // identificador: llamarlo dos veces crea DOS documentos. `setDoc` escribe
      // en la dirección que le dimos, así que llamarlo dos veces deja uno solo
      // —el segundo pisa al primero—.
      //
      // Los campos se escriben uno por uno, y el `id` no está en la lista: ya es
      // el nombre del documento. El mismo dato en dos lugares es el mismo dato
      // que se puede desincronizar.
      await setDoc(target, {
        slug: program.slug,
        name: program.name,
        area: program.area,
        hours: program.hours,
        priceBs: program.priceBs,
        mode: program.mode,
        active: program.active,
      });
    } catch (error) {
      // Escribir está cerrado en muchos proyectos hasta que alguien abre las
      // reglas. Si esto aparece en la consola, el problema no está en el código.
      console.error('[programs] No se pudo guardar. ¿Las reglas permiten escribir?', error);
    }
  }

  // ── De acá para abajo, lo que la pantalla no necesita saber ────────────────

  /**
   * El borde: entra un documento de Firestore, sale un `Program`.
   *
   * Es `private` porque solo tiene sentido adentro de este servicio, y es un
   * método de la clase y no una función suelta al final del archivo: si es del
   * servicio, vive en el servicio.
   */
  private toProgram(id: string, data: DocumentData): Program {
    // `DocumentData` es «lo que sea que haya adentro»: TypeScript no conoce esos
    // campos. Esta línea es la que dice, una vez y en un solo lugar, con qué
    // forma vienen: un `Program` sin su `id`, porque en Firestore el
    // identificador ES el nombre del documento y no un campo más.
    //
    // Es una promesa nuestra, no una comprobación: si alguien carga un precio
    // como texto desde la consola de Firebase, acá pasa igual.
    const stored = data as Omit<Program, 'id'>;

    // Los campos guardados se copian tal cual —los tres puntos, «spread»— y el
    // `id` se pone AL FINAL. El orden no es cosmético: si alguien cargó por
    // error un campo `id` dentro del documento, escribirlo primero dejaría que
    // ese campo pisara el nombre real y todos los enlaces apuntarían mal.
    // Lo último que se escribe gana, y lo que tiene que ganar es el `id` real.
    return { ...stored, id };
  }
}
