#!/usr/bin/env node

/**
 * Script inteligente para generar tipos de TypeScript desde Supabase
 * 
 * Funciona automáticamente en desarrollo (local) y producción (remoto)
 * coherente con el flujo de migraciones SQL.
 * 
 * Uso:
 *   pnpm db:types              # Auto-detecta: local si está disponible, sino remoto
 *   pnpm db:types --local      # Forzar modo local (desarrollo con migraciones)
 *   pnpm db:types --remote     # Forzar modo remoto (producción)
 * 
 * Requiere:
 *   - Supabase CLI instalado: pnpm add -g supabase
 *   - Para modo local: Supabase local corriendo (supabase start)
 *   - Para modo remoto: NEXT_PUBLIC_SUPABASE_URL en .env.local
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Leer .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env.local');
  const envLocalPath = path.join(__dirname, '../.env');
  
  let envFile = null;
  if (fs.existsSync(envPath)) {
    envFile = envPath;
  } else if (fs.existsSync(envLocalPath)) {
    envFile = envLocalPath;
  }
  
  if (envFile) {
    const content = fs.readFileSync(envFile, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remover comillas si las tiene
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

// Verificar si Supabase local está disponible
function isLocalAvailable() {
  try {
    execSync('supabase status', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Generar tipos desde Supabase local (migraciones locales)
function generateFromLocal() {
  console.log('🔄 Generando tipos desde Supabase LOCAL (migraciones locales)...');
  
  try {
    const command = `supabase gen types typescript --local`;
    const types = execSync(command, { encoding: 'utf-8' });
    return { types, source: 'local' };
  } catch (err) {
    console.error('❌ Error al generar desde local:', err.message);
    throw err;
  }
}

// Generar tipos desde Supabase remoto (producción)
function generateFromRemote() {
  loadEnvFile();
  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está configurada');
  }
  
  const projectIdMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!projectIdMatch) {
    throw new Error(`URL de Supabase inválida: ${SUPABASE_URL}`);
  }
  
  const projectId = projectIdMatch[1];
  console.log('🔄 Generando tipos desde Supabase REMOTO (producción)...');
  console.log(`   Project ID: ${projectId}`);
  
  try {
    const command = `supabase gen types typescript --project-id ${projectId}`;
    const types = execSync(command, { encoding: 'utf-8' });
    return { types, source: 'remote', projectId };
  } catch (err) {
    console.error('❌ Error al generar desde remoto:', err.message);
    throw err;
  }
}

// Determinar modo de operación
function determineMode() {
  const args = process.argv.slice(2);
  
  if (args.includes('--local')) {
    return 'local';
  }
  if (args.includes('--remote')) {
    return 'remote';
  }
  
  // Auto-detección: intenta local primero, sino remoto
  if (isLocalAvailable()) {
    return 'local';
  }
  return 'remote';
}

// Función principal
function main() {
  const outputPath = path.join(__dirname, '../lib/supabase/types/database.gen.ts');
  
  // Verificar que Supabase CLI está instalado
  try {
    execSync('supabase --version', { stdio: 'ignore' });
  } catch {
    console.error('❌ Error: Supabase CLI no está instalado');
    console.error('   Instálalo con: pnpm add -g supabase');
    console.error('   O visita: https://supabase.com/docs/guides/cli');
    process.exit(1);
  }
  
  const mode = determineMode();
  let result;
  
  try {
    if (mode === 'local') {
      if (!isLocalAvailable()) {
        console.error('❌ Error: Supabase local no está corriendo');
        console.error('   Ejecuta: supabase start');
        console.error('   O usa: pnpm db:types --remote para generar desde producción');
        process.exit(1);
      }
      result = generateFromLocal();
    } else {
      result = generateFromRemote();
    }
  } catch (err) {
    // Si falla en modo auto y estaba intentando local, intenta remoto
    if (mode === 'local' && !process.argv.includes('--local')) {
      console.log('');
      console.log('⚠️  No se pudo generar desde local, intentando desde remoto...');
      try {
        result = generateFromRemote();
      } catch (remoteErr) {
        console.error('❌ Error al generar tipos:', remoteErr.message);
        if (remoteErr.stdout) console.error('Salida:', remoteErr.stdout);
        if (remoteErr.stderr) console.error('Errores:', remoteErr.stderr);
        process.exit(1);
      }
    } else {
      console.error('❌ Error al generar tipos:', err.message);
      if (err.stdout) console.error('Salida:', err.stdout);
      if (err.stderr) console.error('Errores:', err.stderr);
      process.exit(1);
    }
  }
  
  // Crear header con información del origen
  const timestamp = new Date().toISOString();
  const sourceInfo = result.source === 'local' 
    ? 'DB local (migraciones locales aplicadas)'
    : `DB remota (producción${result.projectId ? ` - Project: ${result.projectId}` : ''})`;
  
  const header = `/**
 * ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR MANUALMENTE
 * 
 * Este archivo se genera automáticamente desde tu base de datos de Supabase.
 * Para regenerarlo, ejecuta: pnpm db:types
 * 
 * Generado desde: ${sourceInfo}
 * Fecha: ${timestamp}
 * 
 * Modos disponibles:
 *   - pnpm db:types              # Auto-detecta (local si disponible, sino remoto)
 *   - pnpm db:types --local      # Desde DB local (migraciones locales)
 *   - pnpm db:types --remote     # Desde DB remota (producción)
 * 
 * Este archivo contiene los tipos base generados desde Supabase.
 * Para validaciones runtime, usa los esquemas Zod en lib/validations/
 * 
 * Flujo recomendado con migraciones:
 *   1. Crear migración: supabase migration new nombre_migracion
 *   2. Escribir SQL en supabase/migrations/...
 *   3. Aplicar localmente: supabase db reset
 *   4. Generar tipos: pnpm db:types --local
 *   5. Cuando esté listo: aplicar migraciones a producción y ejecutar pnpm db:types
 */

`;
  
  fs.writeFileSync(outputPath, header + result.types);
  
  console.log('');
  console.log('✅ Tipos generados exitosamente!');
  console.log(`   Origen: ${sourceInfo}`);
  console.log(`   Archivo: ${outputPath}`);
  console.log('');
  
  if (result.source === 'local') {
    console.log('📝 Nota: Tipos generados desde migraciones locales');
    console.log('   Cuando apliques migraciones a producción, ejecuta: pnpm db:types --remote');
  } else {
    console.log('📝 Nota: Tipos generados desde producción');
    console.log('   Para desarrollo con migraciones locales, ejecuta: pnpm db:types --local');
  }
  
  console.log('');
  console.log('📝 Próximos pasos:');
  console.log('   1. Revisa database.gen.ts para ver los tipos actuales');
  console.log('   2. Agrega validaciones Zod en lib/validations/ donde las necesites');
  console.log('   3. Ejecuta "pnpm check" para verificar errores de TypeScript');
}

main();

