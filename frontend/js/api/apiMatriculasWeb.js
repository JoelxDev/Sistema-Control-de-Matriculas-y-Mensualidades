document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('matriculaForm');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnFinalizar = document.getElementById('btnFinalizar');
    const alertContainer = document.getElementById('alertContainer');

    let currentStep = 1;
    const totalSteps = 3;

    // Función para mostrar alertas
    function showAlert(message, type = 'error') {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} show">
                ${message}
            </div>
        `;
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }

    // Función para actualizar los pasos visuales
    function updateSteps() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
            }
        });
    }

    // Función para mostrar la sección actual
    function showSection(stepNumber) {
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const currentSection = document.querySelector(`[data-section="${stepNumber}"]`);
        if (currentSection) {
            currentSection.classList.add('active');
        }

        // Actualizar botones
        btnAnterior.style.display = stepNumber === 1 ? 'none' : 'inline-block';
        btnSiguiente.style.display = stepNumber === totalSteps ? 'none' : 'inline-block';
        btnFinalizar.style.display = stepNumber === totalSteps ? 'inline-block' : 'none';

        updateSteps();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Validar sección actual
    function validateCurrentSection() {
        const currentSection = document.querySelector(`[data-section="${currentStep}"]`);
        const inputs = currentSection.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value || !input.checkValidity()) {
                isValid = false;
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
            }
        });

        return isValid;
    }

    // Botón Siguiente
    btnSiguiente.addEventListener('click', () => {
        if (validateCurrentSection()) {
            if (currentStep < totalSteps) {
                currentStep++;
                showSection(currentStep);
            }
        } else {
            showAlert('Por favor, complete todos los campos requeridos antes de continuar.');
        }
    });

    // Botón Anterior
    btnAnterior.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showSection(currentStep);
        }
    });

    // Lógica para cambiar grados según el nivel seleccionado
    document.getElementById('nivel').addEventListener('change', function() {
        const nivel = this.value;
        const gradoSelect = document.getElementById('grado');
        gradoSelect.innerHTML = '<option value="">Seleccione un grado</option>';
        gradoSelect.disabled = false;

        let grados = [];
        if (nivel === 'inicial') {
            grados = ['3 años', '4 años', '5 años'];
        } else if (nivel === 'primaria') {
            grados = ['1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria'];
        } else if (nivel === 'secundaria') {
            grados = ['1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria'];
        }

        grados.forEach(grado => {
            const option = document.createElement('option');
            option.value = grado;
            option.textContent = grado;
            gradoSelect.appendChild(option);
        });
    });

    // Validar DNI (solo números, 8 dígitos)
    const dniInputs = ['dni', 'dniPadre', 'dniMadre'];
    dniInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function(e) {
                this.value = this.value.replace(/\D/g, '').substring(0, 8);
            });
        }
    });

    // Envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateCurrentSection()) {
            showAlert('Por favor, complete todos los campos requeridos.');
            return;
        }

        // Preparar datos
        const formData = {
            nombre_estudiante: document.getElementById('nombres').value,
            apellido_estudiante: `${document.getElementById('apellidoPaterno').value} ${document.getElementById('apellidoMaterno').value}`,
            dni_estudiante: document.getElementById('dni').value,
            fecha_nacimiento: document.getElementById('fechaNacimiento').value,
            genero: document.querySelector('input[name="genero"]:checked')?.value,
            nombre_padre: document.getElementById('nombrePadre').value || null,
            dni_padre: document.getElementById('dniPadre').value || null,
            nombre_madre: document.getElementById('nombreMadre').value || null,
            dni_madre: document.getElementById('dniMadre').value || null,
            ubicacion: document.getElementById('ubicacion').value || null,
            nivel: document.getElementById('nivel').value,
            grado: document.getElementById('grado').value
        };

        try {
            btnFinalizar.disabled = true;
            btnFinalizar.textContent = 'Enviando...';

            const response = await fetch('/api/matriculas-web', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('¡Matrícula registrada exitosamente! Nos contactaremos pronto.', 'success');
                setTimeout(() => {
                    form.reset();
                    currentStep = 1;
                    showSection(1);
                }, 2000);
            } else {
                showAlert('Error: ' + result.message);
            }

        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al enviar el formulario. Por favor, intente nuevamente.');
        } finally {
            btnFinalizar.disabled = false;
            btnFinalizar.textContent = '✓ Finalizar Matrícula';
        }
    });

    // Inicializar
    showSection(1);
});