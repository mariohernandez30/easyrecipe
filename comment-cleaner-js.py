

import os
import re

def remove_comments(file_path):
    try:

        with open(file_path, 'rb') as file:
            content_bytes = file.read()


        if b'\r\n' in content_bytes:
            line_ending = '\r\n'
        else:
            line_ending = '\n'

        try:
            content = content_bytes.decode('utf-8')
        except UnicodeDecodeError:
            content = content_bytes.decode('latin-1')
    except Exception as e:
        print(f"Error al leer {file_path}: {e}")
        return

    content = content.replace('\r\n', '\n')
    lines = content.split('\n')

    processed_lines = []
    for line in lines:
        processed_line = re.sub(r'([^:/]|^)\s*//.*', r'\1', line)
        processed_lines.append(processed_line)

    # Unir con el salto de línea original
    content = line_ending.join(processed_lines)

    # Eliminar líneas en blanco consecutivas (más de una)
    content = re.sub(r'(\r?\n)\s*(\r?\n)\s*(\r?\n)+', r'\1\2', content)

    # Sobrescribir el archivo original manteniendo el formato de saltos de línea
    try:
        with open(file_path, 'wb') as file:
            file.write(content.encode('utf-8'))
        print(f"Archivo actualizado: {file_path}")
    except Exception as e:
        print(f"Error al escribir {file_path}: {e}")

def delete_clean_files():
    # Eliminar todos los archivos .clean.js existentes
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root:
            continue

        for file in files:
            if file.endswith('.clean.js'):
                clean_file_path = os.path.join(root, file)
                try:
                    os.remove(clean_file_path)
                    print(f"Archivo eliminado: {clean_file_path}")
                except Exception as e:
                    print(f"Error al eliminar {clean_file_path}: {e}")

def main():
    # Primero eliminar archivos .clean.js existentes
    delete_clean_files()

    # Trabajar solo en las carpetas src, test y public
    for root, dirs, files in os.walk('.'):
        # Saltar el directorio node_modules
        if 'node_modules' in root:
            continue

        if any(folder in root for folder in ['src', 'test', 'public']):
            for file in files:
                if file.endswith('.js') and not file.endswith('.clean.js'):
                    file_path = os.path.join(root, file)
                    print(f"Procesando: {file_path}")
                    remove_comments(file_path)

if __name__ == '__main__':
    main()
