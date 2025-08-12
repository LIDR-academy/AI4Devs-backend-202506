## Validacion del sistema antes d einciar a solicitar ajustes
# Prompt #  1 conociendo el proyecto
Eres un experto arquitecto de sistemas con experiencia en ATS. Generame una documentacion para el archivo /documentation/alcance.md en formato markdown donde se especifique:
1. proposito del negocio de LTI
2. Estructura de carpetas
3. arquitectura de backend y frontend 

# Promt #2 Estructura de base de datos
Como experto en bases de datos. Dame una documentación del modelo de datos que explique las relaciones con los campos y un diagrama en formato mermaid @prisma/ , entregamelo en formato markdown en el archivo ModeloDatos.md de la carpeta de documentation

#prompt ·3, Creacion de opcion de listar posiciones paso uno 
como product owner necesito crear la historia de usuario para qu eel reclutador pueda listar las posiciones abiertas. en la misma pantalla donde aparece añadir candidato, añadir a esta histrio el detalle tecnico y especifico para permitir al developer ser totalmente autonomo a la hora de completarla. Fvaor entiende la necesidad y entrega un historia mejorada qeu sea mas clara, especifica y concisa acorde con las mejores prácticas de prodcuto, incluyendo descripcion complketa de la funcionalidad, lista de campos a tocar, estructura, URL de los end points, ficheros a modificar alienado con la arquitectura y buenas practicas copmo DDD DRY, creacion d etest unitarios y requisitos no funcionales realitvos a la seguridad, rendimiento etc. Entregame esto en formato markdown enel archivo HistoriaPosicion.md de la carpeta de Documentation 

# promt #4 implenmentacion primera histopria de usuario
prompt 4.1
Listeme los pasos para implementar de una manera ordenada y segura esta historia y espere que autorice la ejecución de cada paso. 
prompt 4.2 Correccion plan
porque va a crear el modelo Posicion.ts si ya existe esta tabla en la base de datos?
Luego de este ptompt inicia con fase 1 y voy paso a paso revisndo el cambio y aprobando

Al terminar fase2 cointruccion encuentro qeu hay problemas de compilación   y se arrglo

promtpt #5. Segunda parte del ejercicio, Kanban
basado en esta historia de usarios "HistoriaPosicion" bajo los mismos parametros de calidad y control creeme una similar que permita al reclutador al seleccionar en cada posicion el boton de detalle cree una vista con un tablero kanban asi.
Las columas deben ser las que corresponden al timpo de posicion de la tabla Interview Steps.
En cada columna de acuerdo con la tabla Interview ubique a cada candidato en su ultimas entrevista "InterviewStepId" mostrando Nombre y promedio de los scores acumulados para cada candidato, los scores van de 1 a 5 por entrevista el promedio debe etar con un numero de 0 a 5 muestre el score con estrellas mostrando los decimales con estrellas o puntos semi rellenos.
antes de iniciar a crear codigo hjagame preguntazs relevantes para veriifcar compresion del pedido y una vez se aclaren muestre em plan de implementación paso a paso donde esocifica las acciones ocmo campos a modificar funciones y cambios en el codigo, espere aprobacion por cada paso del plan.

promp 5.1 aclaraciones solicitadas
1. columnas Kanban dinamicas. Las posiciones no tienen InterviewSteps tienen InterviewFlowId y InterviewStep tiene las columasn del kanban, si iuna posicion no tiene InterviewFlowId o no exiten regitros relacionados en InterviewSpets debe mostrar un error "Esta posicon no tiene definidos etapas"
2.1 Un candidato solo aparece en su ultioma entrevista.
2.2 para candidatos que no han aplicado y no tienen entrevistas debe aparecern en el Kanban una primera columna llamada "Aplicacion" con scrore cero (ninguna estrella rellena )
3.1 el promedio es sobre todas las entrevistas para esa aplicacion. 
3. 2 Sin o tiene escore el score sera cero
4.1 botón d edetalle en PositionCard
4.2 la vista de kanban sera una nueva pagina
4.3 No se necesita funcionalidad de drag and drop en este momento.
5. no en ambas preguntas
6. En esta version no gneremos paginas 
7. no hay esetados para candidatos.

Prompt 5.2 Se encontraron errore en las etiquetas del kanban y ajsutes de pagina CSS para mejor presentación 

Prompt 5.3 vamos al ultimo paso donde se ajusta el README y se termina la implementacion de esta hiustoria de usario
