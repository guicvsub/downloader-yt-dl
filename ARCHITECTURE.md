# Arquitetura do Projeto

Este arquivo documenta as tecnologias e o stack atualizado do projeto, para ser consultado sempre que houver dúvidas sobre como as aplicações estão estruturadas.

## Frontend

- **Framework Atual**: **Tauri**
- **Nota Importante**: Embora as versões iniciais utilizassem apenas React/Vite para a web, o frontend atual é empacotado e executado como um aplicativo desktop utilizando **Tauri**. 

*Sempre considere que estamos trabalhando no ecossistema do Tauri ao fazer modificações no frontend, como invocar APIs nativas, gerenciar o ciclo de vida da janela (minimizar, fechar) e lidar com permissões do sistema.*

## Backend

- **Linguagem**: Python (Flask)
- **Engine**: yt-dlp
- **Função**: Lidar com as regras de download, extração de metadados de mídia e contornar bloqueios do YouTube.
