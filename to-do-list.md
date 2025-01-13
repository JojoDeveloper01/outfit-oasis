- Login Register distinguir entre user e stuff ✅
- Só ser utilizada pelos funcionários e User ✅
- User 
  - Podem vizualizar e reservar items ✅
- Stuff
  - Gerir o inventário (CRUD) ✅
  - Iserção: ✅
    -  roupa,
    -  tamanho
    -  marca
    -  cor
  - Consulta ✅
    - Procurar por categoria, tamanho, cor ou marca
  - Atualização ✅
    - editar informações já criadas
  - Eliminação ✅
    - Remover registos já não estejam disponíveis para alugar ✅

- Vizualizar estado de artigo (disponível, reservado) ✅

- Sistema de reservas
  - clientes podem reservar, especificando as datas pretendidas do aluguer do artigo e confirmar por email a reserva ✅
  - A reserva só é concluida quando a pessoa paga ✅
  
- Histórico
  - Registo das reservas e devoluções dos clientes, acessível pelo cliente e pelo admin ✅

- API
  - Para qualquer pessoa conseguir obter a informação do artigo consoante categoria, cor, nome do artigo, tamanho, marcas, etc

- Tabelas:
  - Users
  - Artigos
  - Reserva
  - Alugueres
  - Pagamentos

----------------

- arranjar o sistema de Login (os campos estão todos trocados na DB)

- preencher as tabelas rentals e pagamentos usando actions ✅
- mandar um email quando seja feito a compra para confirmar que foi feita e pôr o id de compra ✅
- só deixar que os utilizadores cliquem em rentar, de resto, vai pedir para iniciar sessão ou criar conta ✅
- fazer o historial de rents até o momento. Pode ser visivel pelos users e admins ✅


- deixar que os items possam ser reservados mesmo já estando reservado uma vez,
só deve estar reservado completamente quando todos os dias estiverem cheios 

- confirmar o email quando incia sessão 
- fazer as analiticas de quem entrou em cada página 
- fazer o inbox em que o user pode fazer uma perguntas sobre os items que rentou e qualquer admin pode responder 
- fazer a página inicial de dashboaard que seria todo o dashboard só que resumido e com links a cada página correspondente
- fazer API para que qualquer pessoa possa obter todos os items da página e filtrar
- fazer documentação da API simples e rapida
- pôr a página bonita 
    - fazer a landing page mostrando as diferentes roupas
    - fazer um fundo movivel, que se mexa com o scroll, como um video/imagens e a cada pixel que seja mmovido para baixo, umas milesimas de segundos ou alguma imagens s\ao mostradas
      
- Publicar ou em vercel ou em railway (de preferencia railway)
- enviar o trabalho