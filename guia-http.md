# Codigo de Respuestas HTTP
200 Respuestas satisfactorias
---------------------------------------------------------
- 200 OK --- Respuesta Exitosa
- 201 Created --- Recurso creado
- 202 Accepted --- Aceptado
---------------------------------------------------------
400  Errores del Cliente
---------------------------------------------------------

- 400 Bad Request
- 401 Unauthorized --- El usuario no tiene autenticación alguna.
- 403 Forbidden --- El usuario esta atutenticado pero no tiene permisos para el recurso.
- 404 Not Found --- El recurso no existe.

---------------------------------------------------------

500 Errores del Servidor
---------------------------------------------------------
- 500 Internal Server Error
- 503 Service Unavailable
# Verbos HTTP

## GET
- Solicita  imformacion al servidor de datos o recursos especificos.
- No tienen body en la peticion.

## POST
- Envia datos al al servidor para crear un recurso.
- Tiene un body en la peticion.

## PUT
- Actualiza la informacion de un recurso en el servidor.
- Se utiliza el body para enviar los datos a actualizar.

## DELETE
- Elimina un recurso del servidor.
- No tiene body en la peticion.

## PATCH
- Actualiza parcialmente un recurso.


# Headers HTTP

Los headers HTTP son metaddatos que se envian en las solicitudes y respuesta HTTP para proporcionar informacion adicional.

## Tipos de headers HTTP

- Accept: Indicia el tipo de contenido que el cliente puede procesar:
    - Accept: application/json
- Authorization: Se usa para autenticacion mediante tokens o credenciales.
    - Authorization: Bearer `<token>`
- Content-Type: Indica el tipo de contenido que son enviados en body de la peticion.
    - Content-Type: application/json
- User-Agent: Indica el tipo de cliente que realiza la solicitud
     - User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3