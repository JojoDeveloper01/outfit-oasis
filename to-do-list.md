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

- Tabelas: ✅
  - Users
  - Artigos
  - Reserva
  - Alugueres
  - Pagamentos

- API (Opcional) ✅❌
  - Para qualquer pessoa conseguir obter a informação do artigo consoante categoria, cor, nome do artigo, tamanho, marcas, etc
  é precido uma API para o admin ou simplesmente obter os items?
----------------

- preencher as tabelas rentals e pagamentos usando actions ✅
- mandar um email quando seja feito a compra para confirmar que foi feita e pôr o id de compra ✅
- só deixar que os utilizadores cliquem em rentar, de resto, vai pedir para iniciar sessão ou criar conta ✅
- fazer o historial de rents até o momento. Pode ser visivel pelos users e admins ✅

- deixar que os items possam ser reservados mesmo já estando reservado uma vez ✅

- Corregir que n se possa reservar em só um dia pois na vdd n é só um dia, é 0. 
Ou que seja contado como menos de um dia e seja o mesmo preço de um dia ou 20% menos. ✅
- Que n se possa obter o intervalo de dias quando passas por dias bloqueados, nem o hover deve ver-se. ✅

15/01:
- Corregir o label de disponibilidade ✅

- Quando o item chegue ao dia final do aluguel, mostrar a opção de finalizar a reserva, 
em seguida vai atualizar o aluguel e
pôr o return_date (dia que finalizou o aluguel) e o "completed" em rental_status ✅

- Em dashbora/items não mostrar os rentals dos items que tem rental_status como "completed" ✅

- Arranjar o sistema de Login (os campos estão todos trocados na DB) ✅

- Que o utilizadores possam mudar o seu nome, email, password e foto ✅

----------------- 
- fazer as analiticas de quem entrou em cada página ✅
- fazer a página inicial de dashboaard que seria todo o dashboard só que resumido e com links a cada página correspondente
- pôr a página bonita 
    - fazer a landing page mostrando as diferentes roupas
    - fazer um fundo movivel, que se mexa com o scroll, como um video/imagens e a cada pixel que seja mmovido para baixo, umas milesimas de segundos ou alguma imagens s\ao mostradas
- fazer documentação

- Pôr a página em en, pt e es (de preferência em todas as linguagens)

- Ver se dá para optimizar o max possível (mais rapido, mais simples, escalavel)
      
- Publicar ou em vercel ou em railway (de preferencia railway)
- enviar o trabalho