# 📦 Project Migration Guide

## 🎉 ¡Bienvenido a tu Nuevo Framework de Testing!

Tu proyecto ha sido completamente reestructurado con las mejores prácticas de la industria. Esta guía te ayudará a entender los cambios y cómo empezar.

---

## 🔄 Cambios Principales

### Antes ❌
```
k6-grafana/
├── k6/
│   ├── functionary/
│   │   ├── services/
│   │   │   └── functionary.js (código mezclado)
│   │   └── tests/
│   │       └── front-functionary.js (todo en un archivo)
│   └── utilities/
│       └── setup.js
├── data/ (sin estructura clara)
└── README.md (documentación básica)
```

### Ahora ✅
```
k6-grafana/
├── config/                    # 🎛️ Configuraciones centralizadas
│   ├── strategies.js         # Estrategias de prueba
│   ├── environments.js       # Configuración por ambiente
│   └── metrics.js            # Métricas personalizadas
│
├── services/                  # 🔧 Lógica de negocio separada
│   ├── auth.service.js       # Autenticación con caché
│   └── functionary.service.js # Operaciones del functionary
│
├── tests/                     # ✅ Tests organizados
│   └── functionary/
│       └── front-functionary.test.js
│
├── utils/                     # 🛠️ Utilidades reutilizables
│   └── helpers.js
│
├── data/                      # 📊 Datos de prueba
│   └── users.sandbox.json.example
│
├── scripts/                   # 🚀 Scripts de automatización
│   ├── run-test.sh           # Ejecutor principal
│   ├── setup-influxdb.sh     # Setup automático
│   ├── setup-grafana.sh      # Configuración Grafana
│   └── quick-test.sh         # Test rápido
│
├── reports/                   # 📈 Reportes generados
├── grafana/                   # 📊 Dashboards
├── docker-compose.yml         # 🐳 Stack mejorado
├── README.md                  # 📚 Documentación completa
├── GETTING_STARTED.md         # 🎯 Guía de inicio rápido
└── package.json               # 📦 Scripts NPM
```

---

## 🆕 Nuevas Características

### 1. ⚡ Estrategias de Prueba Predefinidas
Ya no necesitas configurar manualmente VUs y duración. Usa estrategias predefinidas:

```bash
# Smoke (1min, 2 VUs)
./scripts/run-test.sh --strategy smoke

# Load (9min, 10 VUs ramping)
./scripts/run-test.sh --strategy load

# Stress (12min, hasta 30 VUs)
./scripts/run-test.sh --strategy stress

# Spike (3min, pico de 50 VUs)
./scripts/run-test.sh --strategy spike

# Soak (30min, 10 VUs estables)
./scripts/run-test.sh --strategy soak
```

### 2. 🔐 Caché Inteligente de JWT
El sistema ahora cachea automáticamente los tokens JWT por VU:
- ✅ Menos peticiones de login
- ✅ Tests más rápidos
- ✅ Más realista (usuarios reales mantienen sesión)

```javascript
// Automático - no necesitas hacer nada!
const authInfo = getOrCreateToken(vuId, baseUrl, headers, user);
```

### 3. 📊 Métricas Personalizadas
Nuevas métricas de negocio automáticas:

```
login_duration.................: avg=189ms  p(95)=234ms
login_success_rate.............: 100.00%
jwt_token_reuse................: 45 tokens reutilizados
expedients_fetched.............: 120 expedientes
signatures_pending_count.......: 15 firmas pendientes
```

### 4. 📈 Reportes Profesionales
Reportes HTML interactivos automáticos:

```bash
./scripts/run-test.sh --strategy load --dashboard

# Genera: reports/functionary-load-sandbox-TIMESTAMP.html
```

### 5. 🎯 Scripts de Automatización
Scripts profesionales para todo:

```bash
./scripts/run-test.sh         # Ejecutor principal
./scripts/quick-test.sh       # Test rápido de validación
./scripts/setup-influxdb.sh   # Configurar InfluxDB automáticamente
./scripts/setup-grafana.sh    # Instrucciones de Grafana
```

### 6. 🔧 Configuración por Entornos
Maneja múltiples ambientes fácilmente:

```bash
# Sandbox
./scripts/run-test.sh -e sandbox

# Production
./scripts/run-test.sh -e production

# Local
./scripts/run-test.sh -e local
```

### 7. 📦 NPM Scripts
Comandos simples y memorables:

```bash
npm run test:smoke
npm run test:load
npm run test:stress
npm run test:dashboard
npm run docker:up
npm run docker:down
```

---

## 🚀 Cómo Empezar

### Paso 1: Configurar Datos de Prueba

```bash
# Copiar archivo de ejemplo
cp data/users.sandbox.json.example data/users.sandbox.json

# Editar con tus credenciales reales
nano data/users.sandbox.json
```

Edita el archivo con tus usuarios de prueba reales:

```json
{
  "users": [
    {
      "email": "tu-usuario@example.com",
      "password": "tu-password",
      "app_id": 3,
      "role": "functionary"
    }
  ],
  "functionary": {
    "apiBaseUrl": "https://tu-api.com",
    "authorization": "Bearer tu-token",
    "timeout": 10000
  }
}
```

### Paso 2: Ejecutar tu Primera Prueba

```bash
# Test rápido (1 minuto)
./scripts/run-test.sh --strategy smoke

# Con dashboard visual
./scripts/run-test.sh --strategy smoke --dashboard
```

### Paso 3: Revisar Resultados

Abre el reporte HTML generado en `reports/` - tendrás:
- 📊 Gráficos interactivos
- 📈 Timeline de requests
- ✅ Métricas detalladas
- ❌ Log de errores

---

## 📚 Comparación de Código

### Login - Antes vs Ahora

#### Antes ❌
```javascript
// Todo mezclado en el test
const loginPayload = JSON.stringify(user);
const loginRes = http.post(`${baseUrl}/api/v1/auth/sign_in`, loginPayload, {
    headers: headersBase,
});
check(loginRes, {
    'login 200': (r) => r.status === 200,
    'jwt presente': (r) => r.json('data.jwt') !== undefined,
});
const jwt = loginRes.json('data.jwt');
// Sin caché, sin métricas personalizadas
```

#### Ahora ✅
```javascript
// Servicio separado con caché automático
const authInfo = getOrCreateToken(vuId, baseUrl, headers, user);

// Beneficios:
// ✅ Caché automático de JWT
// ✅ Métricas de login trackeadas
// ✅ Manejo de errores robusto
// ✅ Logging estructurado
// ✅ Código reutilizable
```

### Configuración - Antes vs Ahora

#### Antes ❌
```javascript
// Hardcoded en cada test
export const options = {
    vus: 2,
    duration: '1m',
};
```

#### Ahora ✅
```javascript
// Estrategias centralizadas y reutilizables
const strategy = getStrategy(STRATEGY);  // smoke, load, stress, etc.

export const options = {
    ...strategy,  // Configuración completa
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.98'],
    },
};
```

---

## 🎯 Casos de Uso Comunes

### 1. Test Rápido Diario
```bash
npm run test:smoke
```

### 2. Test Completo Semanal
```bash
npm run test:load
```

### 3. Test Pre-Release
```bash
./scripts/run-test.sh --strategy stress --dashboard
```

### 4. Test con Monitoreo en Tiempo Real
```bash
# Iniciar Grafana
docker-compose up -d

# Configurar InfluxDB
./scripts/setup-influxdb.sh

# Ejecutar con output a InfluxDB
./scripts/run-test.sh --strategy load --output influxdb

# Ver en Grafana: http://localhost:3300
```

### 5. Test de Diferentes Ambientes
```bash
# Sandbox
./scripts/run-test.sh -e sandbox -s load

# Production (cuidado!)
./scripts/run-test.sh -e production -s smoke
```

---

## 🛠️ Personalización

### Agregar Nueva Estrategia

Edita `config/strategies.js`:

```javascript
export const strategies = {
  // ... otras estrategias
  
  custom: {
    stages: [
      { duration: '1m', target: 5 },
      { duration: '5m', target: 15 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.02'],
    },
  },
};
```

Usa así:
```bash
./scripts/run-test.sh --strategy custom
```

### Agregar Nuevo Servicio

Crea `services/mi-servicio.service.js`:

```javascript
import http from 'k6/http';
import { check } from 'k6';
import { trackApiCall } from '../config/metrics.js';

export function miNuevaFuncion(baseUrl, headers) {
  const response = http.get(`${baseUrl}/mi-endpoint`, {
    headers,
    tags: { name: 'mi_operacion' },
  });
  
  check(response, {
    'mi operación ok': (r) => r.status === 200,
  });
  
  return response;
}
```

Importa en tu test:
```javascript
import { miNuevaFuncion } from '../../services/mi-servicio.service.js';
```

### Agregar Métricas Personalizadas

Edita `config/metrics.js`:

```javascript
import { Counter, Trend } from 'k6/metrics';

export const miMetrica = new Trend('mi_metrica_personalizada');

export function trackMiOperacion(duration, success) {
  miMetrica.add(duration);
  // ... más lógica
}
```

---

## 📊 Beneficios del Nuevo Framework

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Estructura** | Monolítica | Modular y escalable |
| **Configuración** | Hardcoded | Centralizada y flexible |
| **Métricas** | Básicas de K6 | +15 métricas personalizadas |
| **Reportes** | Solo consola | HTML, JSON, CSV, Grafana |
| **Reutilización** | Código duplicado | Servicios compartidos |
| **Documentación** | Básica | Completa y profesional |
| **Automatización** | Manual | Scripts inteligentes |
| **Mantenimiento** | Difícil | Fácil y claro |

---

## ✅ Checklist de Migración

- [x] ✅ Estructura modular creada
- [x] ✅ Servicios separados y reutilizables
- [x] ✅ Configuraciones centralizadas
- [x] ✅ Métricas personalizadas implementadas
- [x] ✅ Sistema de caché de JWT
- [x] ✅ Scripts de automatización
- [x] ✅ Docker Compose mejorado
- [x] ✅ Documentación completa
- [x] ✅ Estrategias de prueba predefinidas
- [x] ✅ Reportes profesionales

**Tareas Pendientes para Ti:**
- [ ] Copiar y configurar `data/users.sandbox.json`
- [ ] Actualizar URLs y tokens en el archivo de datos
- [ ] Ejecutar primer test: `./scripts/run-test.sh --strategy smoke`
- [ ] Revisar reporte HTML generado
- [ ] Configurar Grafana (opcional): `./scripts/setup-influxdb.sh`

---

## 🆘 Problemas Comunes

### "No encuentro el archivo de usuarios"
```bash
cp data/users.sandbox.json.example data/users.sandbox.json
nano data/users.sandbox.json  # Edita con tus credenciales
```

### "Todos los requests fallan"
- Verifica la URL en `data/users.sandbox.json`
- Verifica el token de autorización
- Verifica que las credenciales sean correctas

### "El script no es ejecutable"
```bash
chmod +x scripts/*.sh
```

### "K6 no está instalado"
```bash
# Fedora/RHEL
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6

# Verifica
k6 version
```

---

## 📚 Recursos Adicionales

- **README.md**: Documentación completa y detallada
- **GETTING_STARTED.md**: Guía de inicio rápido
- **config/strategies.js**: Todas las estrategias disponibles
- **config/environments.js**: Configuración de ambientes
- **services/**: Implementaciones de referencia

---

## 🎉 ¡Felicidades!

Tu proyecto ahora tiene:
- ✅ Código profesional y mantenible
- ✅ Arquitectura escalable
- ✅ Métricas detalladas
- ✅ Reportes hermosos
- ✅ Documentación completa
- ✅ Scripts automatizados
- ✅ Mejores prácticas de la industria

**¡Ahora sí puedes mostrar esto con orgullo a tu equipo!** 🚀

---

¿Preguntas? Revisa la documentación o los comentarios en el código. Todo está documentado profesionalmente.

**¡A testear se ha dicho!** 💪
