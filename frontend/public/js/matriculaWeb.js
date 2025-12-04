document.addEventListener('DOMContentLoaded', function() {
    console.log('Formulario de matrícula cargado');
    
    const form = document.getElementById('form-matricula');
    
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }

    // Agregar validación de DNI en tiempo real
    const dniInputs = document.querySelectorAll('input[name*="dni"]');
    dniInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Solo permitir números
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Limitar a 8 dígitos
            if (this.value.length > 8) {
                this.value = this.value.slice(0, 8);
            }
        });
    });

    // Validar edad mínima (por ejemplo, 3 años para inicial)
    const fechaNacimientoInput = document.querySelector('input[name="fecha_nacimiento"]');
    if (fechaNacimientoInput) {
        fechaNacimientoInput.addEventListener('change', function() {
            const fechaNacimiento = new Date(this.value);
            const hoy = new Date();
            const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            
            if (edad < 3) {
                alert('El estudiante debe tener al menos 3 años');
                this.value = '';
            }
        });
    }

    // Manejar el envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('Enviando formulario...');

        // Deshabilitar el botón de envío para evitar doble clic
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnOriginalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            // Recopilar datos del formulario
            const formData = new FormData(form);
            const datos = {};
            
            formData.forEach((value, key) => {
                // Convertir valores vacíos a null
                datos[key] = value.trim() === '' ? null : value.trim();
            });

            console.log('Datos a enviar:', datos);

            // Validaciones adicionales en el cliente
            if (!datos.nombre_estudiante || !datos.apellido_estudiante) {
                throw new Error('El nombre y apellido del estudiante son obligatorios');
            }

            if (!datos.dni_estudiante || datos.dni_estudiante.length !== 8) {
                throw new Error('El DNI del estudiante debe tener 8 dígitos');
            }

            if (!datos.fecha_nacimiento) {
                throw new Error('La fecha de nacimiento es obligatoria');
            }

            if (!datos.genero) {
                throw new Error('Debe seleccionar el género del estudiante');
            }

            if (!datos.nivel || !datos.grado) {
                throw new Error('Debe seleccionar el nivel y grado');
            }

            // Validar DNI del padre si se proporcionó
            if (datos.dni_padre && datos.dni_padre.length !== 8) {
                throw new Error('El DNI del padre debe tener 8 dígitos');
            }

            // Validar DNI de la madre si se proporcionó
            if (datos.dni_madre && datos.dni_madre.length !== 8) {
                throw new Error('El DNI de la madre debe tener 8 dígitos');
            }

            // Enviar datos a la API
            const response = await fetch('/api/matriculas-web', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            console.log('Respuesta del servidor:', response.status);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al enviar la matrícula');
            }

            // Éxito - mostrar mensaje y limpiar formulario
            console.log('Matrícula registrada:', result);
            
            // Mostrar mensaje de éxito
            mostrarMensajeExito(result.message || '¡Matrícula registrada exitosamente!');
            
            // Limpiar el formulario
            // form.reset();
            
            // Opcional: redirigir después de 3 segundos
            // setTimeout(() => {
            //     window.location.href = '/';
            // }, 3000);

        } catch (error) {
            console.error('Error al enviar matrícula:', error);
            mostrarMensajeError(error.message || 'Error al registrar la matrícula. Por favor, intente de nuevo.');
        } finally {
            // Rehabilitar el botón
            submitBtn.disabled = false;
            submitBtn.textContent = btnOriginalText;
        }
    });
});

// Función para mostrar mensaje de éxito
function mostrarMensajeExito(mensaje) {
    // Crear elemento de mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-exito';
    mensajeDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        ">
            <h3 style="margin: 0 0 10px 0; font-size: 1.2rem;">✓ ¡Éxito!</h3>
            <p style="margin: 0; font-size: 0.95rem;">${mensaje}</p>
            <p style="margin: 10px 0 0 0; font-size: 0.85rem; opacity: 0.9;">
                Nos contactaremos pronto con usted.
            </p>
        </div>
    `;
    
    document.body.appendChild(mensajeDiv);
    
    // Eliminar mensaje después de 5 segundos
    setTimeout(() => {
        mensajeDiv.remove();
    }, 5000);
}

// Función para mostrar mensaje de error
function mostrarMensajeError(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-error';
    mensajeDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        ">
            <h3 style="margin: 0 0 10px 0; font-size: 1.2rem;">✗ Error</h3>
            <p style="margin: 0; font-size: 0.95rem;">${mensaje}</p>
        </div>
    `;
    
    document.body.appendChild(mensajeDiv);
    
    // Eliminar mensaje después de 5 segundos
    setTimeout(() => {
        mensajeDiv.remove();
    }, 5000);
}

// Agregar animación CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);