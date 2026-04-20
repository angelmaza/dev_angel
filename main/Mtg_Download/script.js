    const api = "https://api.scryfall.com";


    async function buscarimg() {
        let cartas = procesarCartas();
        let cartas_final = [];
        let cajaerror = document.getElementById('error');
        cajaerror.innerHTML = "";
        caja_contador = document.getElementById('num_cartas');
        caja_contador.innerHTML = "";
        let contador_pngs = 0;


        // Use Promise.all to wait for all fetch operations to complete
        await Promise.all(cartas.map(async (carta) => {
            let codigo_set = carta['codigo'];
            let numero_carta = carta['numero'];

            let params = `/cards/${encodeURIComponent(codigo_set)}/${encodeURIComponent(numero_carta)}`;
            let endpoint = api + params;

            try {
                await new Promise(resolve => setTimeout(resolve, 100)); // Delay de 50ms por buenas prácticas
                let response = await fetch(endpoint, {
                    headers: {
                        "User-Agent": "MTGSearchApp/1.0",
                        "Accept": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Error en la búsqueda: " + response.statusText);
                }

                let data = await response.json();

                if (data.card_faces && ((data.layout == 'transform') || data.layout == 'modal_dfc')) {
                    // Si la carta tiene varias caras, recorrer ambas
                    data.card_faces.forEach(face => {
                        // console.log(face);
                        console.log(face.image_uris.png);
                        cartas_final.push([
                            face.name,                 // Nombre de la cara
                            face.image_uris?.normal,   // Imagen en tamaño normal
                            face.image_uris?.png       // Imagen en PNG
                        ]);
                        contador_pngs++;
                    });
                } else {
                    cartas_final.push([data.name, data.image_uris?.normal, data.image_uris?.png]);
                    contador_pngs++;
                }

            } catch (error) {
                console.error(`❌Fallo con ${carta.nombre} Error al cargar ${endpoint}: ${error.message}`); // Muestra error detallado en consola
                cajaerror.innerHTML += `<h4>Te aviso, no se ha encontrado ${carta.nombre}, descargate el png a mano</h4>`;
                // document.getElementById("resultado").innerHTML = `<p>Error: ${error.message}</p>`;
            }
        }));
        caja_contador.innerHTML = `Total de <strong>${contador_pngs}</strong> cartas (las dobles cuentan como 2)`;

        console.log(cartas_final);
        mostrarlistacartas(cartas_final);
    }

    function mostrarlistacartas(cartas_final) {
        // console.log(cartas_final);

        let contenedor = document.getElementById('resultado');
        contenedor.innerHTML = ""; // Limpiar el contenedor antes de agregar nuevas cartas

        cartas_final.forEach(carta => {
            let card = document.createElement('div');
            card.classList.add('card'); //  para los estilos

            let nombre = document.createElement('p');
            nombre.textContent = carta[0]; 
            nombre.classList.add('card-nombre'); // Clase para el nombre

            let imagen = document.createElement('img');
            imagen.src = carta[1]; // URL de la imagen
            imagen.classList.add('card-imagen'); // Clase para la imagen

            // Agregar elementos a la tarjeta
            card.appendChild(nombre);
            card.appendChild(imagen);
            contenedor.appendChild(card);
        });

        // boton para descargar
        let downloadButton = document.createElement('button');
        downloadButton.classList = "boton-descarga";
        downloadButton.textContent = "Download All Cards";

        downloadButton.addEventListener('click', () => {
            descargarTodasLasCartas(cartas_final);
        });
        let cajaboton = document.getElementById('zonaboton');
        cajaboton.innerHTML = "";
        cajaboton.prepend(downloadButton);
    }


    function procesarCartas() {
        // Obtener el texto del textarea
        let texto = document.getElementById('cartas').value.trim();

        // Dividir el texto en líneas y procesar
        let lineas = texto.split('\n');
        let cartas = lineas.map(linea => {
            // regex para extraer el nombre, código y número
            let linea_bien = linea.replace(/\*\S+\*/g, "").trim(); // Elimina cualquier texto entre dos asteriscos

            let match = linea_bien.match(/^\d+\s+(.+?)\s+\(([^)]+)\)\s+(\S+)$/);

            if (match) {
                return {
                    nombre: match[1].trim(), // Nombre 
                    codigo: match[2],        // Código 
                    numero: match[3].trim()  // Número
                };
            }
            return null; 
        }).filter(carta => carta !== null); // Filtrar líneas no válidas

        return cartas; //array de cartas procesadas
    }

    async function descargarTodasLasCartas(cartas_final) {
        const zip = new JSZip(); // Crear el archivo ZIP
        const folder = zip.folder("cards"); // Crear carpeta en el ZIP

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Crear o seleccionar elementos para mostrar progreso
        let divprogreso = document.getElementById('divprogreso');
        divprogreso.style.display = 'inline-block';

        let progreso = document.getElementById("progreso");
        let estado = document.getElementById("estado");

        if (!progreso) {
            progreso = document.createElement("progress");
            progreso.id = "progreso";
            progreso.max = cartas_final.length;
            progreso.value = 0;
            document.body.appendChild(progreso);
        } else {
            progreso.max = cartas_final.length;
            progreso.value = 0;
        }

        if (!estado) {
            estado = document.createElement("p");
            estado.id = "estado";
            document.body.appendChild(estado);
        }
        let contador = 0;
        for (let i = 0; i < cartas_final.length; i++) {
            // console.log("cantidad pngs" + cartas_final.length);
            const carta = cartas_final[i];
            try {
                estado.textContent = `Descargando ${carta[0]} (${i + 1}/${cartas_final.length})...`;

                const response = await fetch(carta[2]); // URL PNG
                console.log(contador);
                contador++;
                console.log(response);

                if (!response.ok) {
                    throw new Error(`Error al descargar: ${carta[0]}`);
                }
                const blob = await response.blob(); 
                folder.file(`${i}_${carta[0]}.png`, blob);

                progreso.value = i + 1; 
            } catch (error) {
                console.error(`Error descargando ${carta[0]}:`, error);
            }

            await delay(100); // Delay para que scryfall no pete
        }

        // Generar el ZIP y descargarlo
        estado.textContent = "Generando archivo ZIP...";
        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "cards.zip");
            estado.textContent = "Descarga completada.";
            progreso.remove(); 
        });
    }

    // async function descargarTodasLasCartas(cartas_final) {
    //     const zip = new JSZip(); // Create a new ZIP file
    //     const folder = zip.folder("cards"); // Create a folder inside the ZIP file

    //     // Function to introduce a delay
    //     const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    //     // Fetch each image and add it to the ZIP file with a delay
    //     for (let i = 0; i < cartas_final.length; i++) {
    //         const carta = cartas_final[i];
    //         try {
    //             const response = await fetch(carta[2]); // carta[2] is the PNG URL
    //             if (!response.ok) {
    //                 throw new Error(`Failed to fetch image: ${carta[0]}`);
    //             }
    //             const blob = await response.blob(); // Get the image as a Blob
    //             folder.file(`${carta[0]}.png`, blob); // Add the image to the ZIP folder
    //         } catch (error) {
    //             console.error(`Error downloading image for ${carta[0]}:`, error);
    //         }

    //         // Add a delay of 100ms between requests
    //         if (i < cartas_final.length - 1) {
    //             await delay(100);
    //         }
    //     }

    //     // Generate the ZIP file and trigger the download
    //     zip.generateAsync({ type: "blob" }).then((content) => {
    //         saveAs(content, "cards.zip"); // Use FileSaver.js to save the ZIP file
    //     });
    // }
