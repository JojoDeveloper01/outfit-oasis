- Login Register distinguir entre user e stuff
- Só ser utilizada pelos funcionários e User
- User
  - Podem vizualizar e reservar items
- Stuff
  - Gerir o inventário (CRUD)
  - Iserção:
    -  roupa,
    -  tamanho
    -  marca
    -  cor
  - Consulta
    - Procurar por categoria, tamanho, cor ou marca
  - Atualização
    - eidtar informações já criadas
  - Eliminação
    - Remover registos já não estejam disponíveis para alugar

- Vizualizar estado de artigo (disponível, reservado)
- Sistema de reservas
  - clientes podem reservar, especificando as datas pretendidas do aluguer do artigo e confirmar por email a reserva
  - A reserva só é concluida quando a pessoa paga
  
- Histórico
  - Registo das reservas e devoluções dos clientes, acessível pelo cliente e pelo admin

- API
  - Para qualquer pessoa conseguir obter a informação do artigo consoante categoria, cor, nome do artigo, tamanho, marcas, etc

- Tabelas:
  - Users
  - Artigos
  - Reserva
  - Alugueres
  - Pagamentos