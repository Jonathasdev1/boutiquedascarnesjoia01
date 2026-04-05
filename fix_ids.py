#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para corrigir IDs duplicados no HTML do projeto Açougue
Renumera todos os id="corte1", id="peso1" para id="corte0", id="peso0", id="corte1", id="peso1", etc.
"""

import re
import sys

def fix_html_ids(html_content):
    """
    Renumera os IDs duplicados no HTML.
    Cada produto recebe um número único.
    """
    
    # Encontrar todas as divs com classe "produto"
    produto_pattern = r'<div class="produto">.*?</div>\s*\n'
    produtos = re.finditer(produto_pattern, html_content, re.DOTALL)
    
    result = html_content
    produto_counter = 0
    
    # Processa o HTML de forma mais segura
    # Divide o HTML por cada bloco de produto
    lines = html_content.split('\n')
    output_lines = []
    in_produto = False
    produto_buffer = []
    
    for line in lines:
        if '<div class="produto">' in line:
            in_produto = True
            produto_buffer = [line]
        elif in_produto:
            produto_buffer.append(line)
            if '</div>' in line and any('<button' in l for l in produto_buffer):
                # Fim do produto encontrado
                if len(produto_buffer) > 5:  # Garante que é um produto completo
                    produto_text = '\n'.join(produto_buffer)
                    
                    # Substitui IDs dentro deste produto
                    # corte1 -> corte{numero}
                    produto_text = re.sub(
                        r'<select id="corte1"',
                        f'<select id="corte{produto_counter}"',
                        produto_text
                    )
                    # peso1 -> peso{numero}
                    produto_text = re.sub(
                        r'<input type="number" id="peso1"',
                        f'<input type="number" id="peso{produto_counter}"',
                        produto_text
                    )
                    # labels também
                    produto_text = re.sub(
                        rf'<label for="corte1">',
                        f'<label for="corte{produto_counter}">',
                        produto_text
                    )
                    produto_text = re.sub(
                        rf'<label for="peso1">',
                        f'<label for="peso{produto_counter}">',
                        produto_text
                    )
                    
                    for l in produto_text.split('\n'):
                        output_lines.append(l)
                    
                    produto_counter += 1
                    in_produto = False
                    produto_buffer = []
                else:
                    produto_buffer.append(line)
        else:
            output_lines.append(line)
    
    return '\n'.join(output_lines)

# Lê o arquivo
html_path = r"c:\Users\Jonathas Netto\OneDrive - Expresso Taubate Logistica E Transportes Ltda\Área de Trabalho\PROJETOS\Projetos pessoais\API\projeto Açougue-Corrigido (1)\projeto Açougue01\projeto Açougue01\index.html"

try:
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Corrige os IDs
    fixed_html = fix_html_ids(html_content)
    
    # Salva de volta
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(fixed_html)
    
    print("✅ IDs renumerados com sucesso!")
    print(f"   Arquivo salvo em: {html_path}")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)
