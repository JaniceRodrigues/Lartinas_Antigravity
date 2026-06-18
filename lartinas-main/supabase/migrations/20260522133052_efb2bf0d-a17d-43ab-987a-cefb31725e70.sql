-- Replace default templates for moradora (hóspede) and proprietário with the official models.
UPDATE public.contract_templates
   SET active = false
 WHERE kind IN ('moradora','proprietario')
   AND active = true;

INSERT INTO public.contract_templates (name, kind, content, active) VALUES
('Contrato de Hospedagem - Coliving (Modelo Oficial)', 'moradora', $TPL$
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE HOSPEDAGEM – COLIVING

**CONTRATADA:** T.K. Pimenta Moreira – Lartinas Raízes Compartilhadas, empresária individual, inscrita no CNPJ nº 58.518.384/0001-19, com sede na Rua Barão de Ipanema, nº 130, apto C02, Copacabana, Rio de Janeiro/RJ, representada por sua titular, Tatiana Kelly Pimenta Moreira, brasileira, solteira, empresária, inscrita no CPF sob o nº 080.504.506-60.

**HÓSPEDE:** {{hospede_nome}}, {{hospede_nacionalidade}}, {{hospede_estado_civil}}, {{hospede_profissao}}, portador(a) do RG nº {{hospede_rg}} e CPF nº {{hospede_cpf}}, residente em {{hospede_endereco}}, e-mail {{hospede_email}}.

### MODALIDADE DA HOSPEDAGEM

A presente hospedagem será prestada na seguinte modalidade, conforme assinalado abaixo:

( ) Feminina   ( ) Masculina   ( ) Mista

**Modalidade aplicável a este contrato:** {{modalidade}}

**Unidade/Quarto:** {{unidade_endereco}}

**Data prevista de ingresso:** {{data_ingresso}}

As partes acima identificadas resolvem celebrar o presente Contrato de Prestação de Serviços de Hospedagem – Coliving, que se regerá pelas cláusulas e condições a seguir.

## CLÁUSULA 1 – OBJETO E NATUREZA JURÍDICA

A CONTRATADA prestará ao(à) HÓSPEDE serviços de hospedagem em unidade mobiliada integrante de empreendimento organizado de coliving, com uso privativo de quarto individual e utilização compartilhada das áreas comuns.

**1.1** Os serviços compreendem, entre outros, limpeza periódica, manutenção predial, fornecimento de internet, gestão operacional, suporte administrativo e demais facilidades inerentes ao modelo de hospedagem e convivência compartilhada.

**1.2** A operação de coliving da CONTRATADA poderá ser organizada, conforme a unidade, o imóvel, a disponibilidade e os critérios internos de gestão, nas modalidades feminina, masculina ou mista, entendendo-se como modalidade mista aquela em que a convivência poderá ocorrer entre homens e mulheres nas áreas compartilhadas e, conforme a configuração da operação, também em setores, unidades ou ambientes definidos pela CONTRATADA. A modalidade aplicável à presente contratação será aquela expressamente assinalada no quadro inicial deste instrumento.

**1.3** O(A) HÓSPEDE declara estar plenamente ciente da modalidade da hospedagem contratada, aceitando expressamente sua estrutura de ocupação, organização interna, regras de convivência e critérios operacionais, reconhecendo que tais elementos integram a própria lógica do serviço de hospedagem prestado pela CONTRATADA.

**1.4** Na hipótese de contratação da modalidade mista, o(a) HÓSPEDE declara ciência expressa de que a operação poderá envolver convivência entre homens e mulheres nas áreas compartilhadas e, conforme a organização da unidade, em ambientes e setores definidos pela CONTRATADA, comprometendo-se a respeitar integralmente as regras internas de convivência, privacidade, segurança e uso dos espaços.

**1.5** O presente instrumento possui natureza jurídica de prestação de serviços de hospedagem, regido pelo Código Civil, não configurando contrato de locação residencial, nem gerando direito à posse autônoma, permanência estável, proteção possessória típica de locação urbana ou expectativa de transformação do vínculo em relação locatícia.

**1.6** A disponibilização do quarto e das áreas comuns é acessória ao conjunto de serviços prestados pela CONTRATADA e integra operação organizada de coliving, submetida a regras internas, rotinas operacionais e padrões de segurança e convivência.

**1.7** Por razões operacionais, de segurança, manutenção, gestão interna ou preservação da boa convivência, a CONTRATADA poderá realocar o(a) HÓSPEDE para unidade equivalente dentro da mesma operação ou para unidade similar sob sua gestão, mediante comunicação prévia razoável, sem que tal providência descaracterize a natureza de hospedagem do presente contrato. Sempre que possível, a realocação preservará a mesma modalidade de hospedagem originalmente contratada. Caso a realocação implique alteração da modalidade assinalada neste instrumento, a mudança dependerá de anuência expressa do(a) HÓSPEDE, salvo hipótese emergencial, excepcional e provisória, devidamente justificada pela CONTRATADA.

## CLÁUSULA 2 – PRAZO

O prazo inicial da hospedagem é de {{prazo_meses}} meses, contados da data de início da ocupação.

**2.1** Poderá haver uma única renovação por igual período, mediante termo aditivo expresso firmado pelas partes antes do término do prazo vigente.

**2.2** A permanência máxima ordinária do(a) HÓSPEDE será de 12 (doze) meses consecutivos. Ultrapassado esse período, eventual nova permanência dependerá da celebração de novo instrumento contratual, a exclusivo critério da CONTRATADA, não havendo direito à prorrogação automática, novação, continuidade ou renovação tácita.

**2.3** A renovação não implica reconhecimento de estabilidade residencial.

**2.4** O decurso do prazo contratual ou eventual tolerância temporária de permanência não converterá a relação em locação, nem importará renúncia da CONTRATADA ao direito de exigir a desocupação da unidade.

## CLÁUSULA 3 – REMUNERAÇÃO E INADIMPLEMENTO

O valor total da hospedagem é de **R$ {{valor_total}}** referente ao período contratado, e será pago em **{{parcelas_qtd}}** parcela(s), conforme cronograma anexo.

**3.1** O atraso sujeitará o(a) HÓSPEDE à multa moratória de 10% (dez por cento) sobre o débito, acrescida de juros de 1% (um por cento) ao mês e atualização monetária.

**3.2** O inadimplemento superior a 10 (dez) dias autoriza a rescisão contratual imediata, sem prejuízo da cobrança extrajudicial ou judicial dos valores devidos.

**3.3** O inadimplemento também autoriza a CONTRATADA a recusar renovação, bloquear nova contratação e exigir a desocupação da unidade na forma da Cláusula 7.

**3.4** Permanecendo o(a) HÓSPEDE na unidade após a rescisão ou após o término do prazo sem autorização expressa da CONTRATADA, ficará caracterizada ocupação irregular, sujeitando-se a HÓSPEDE ao pagamento de indenização diária correspondente a 1/30 (um trinta avos) do valor mensal da hospedagem, sem prejuízo das demais medidas cabíveis.

## CLÁUSULA 4 – GARANTIA CONTRATUAL

O(A) HÓSPEDE prestará depósito de garantia equivalente a 1 (uma) mensalidade da hospedagem, com a finalidade de assegurar o cumprimento das obrigações financeiras e contratuais assumidas no presente instrumento no momento da assinatura deste.

**4.1** A critério da CONTRATADA, ficará dispensada a prestação de depósito de garantia prevista no caput quando o(a) HÓSPEDE efetuar, antes do início da hospedagem, o pagamento integral e antecipado de todo o período contratualmente ajustado.

**4.2** A dispensa da garantia contratual, na forma do item anterior, não afasta nem limita a responsabilidade do(a) HÓSPEDE por danos materiais, despesas extraordinárias imputáveis, descumprimento contratual, indenizações, perdas e danos ou quaisquer outros valores devidos nos termos deste contrato.

**4.3** Na hipótese de renovação, prorrogação, aditamento de prazo ou contratação de período adicional, a CONTRATADA poderá exigir nova garantia contratual, ainda que esta tenha sido dispensada no período inicialmente contratado.

**4.4** Os valores pagos pelo(a) HÓSPEDE antes do início da hospedagem, inclusive a título de caução, pagamento antecipado integral ou pagamento antecipado parcial com finalidade de confirmação de reserva, poderão ser formalizados em recibo específico emitido pela CONTRATADA, o qual integrará a documentação contratual para todos os fins.

**4.5** O eventual recibo de pagamento, confirmação de reserva ou recebimento de garantia terá natureza meramente comprobatória e complementar, não substituindo o presente contrato, seus anexos, regulamentos e eventuais aditivos.

**4.6** O valor da garantia poderá ser utilizado pela CONTRATADA para compensação de mensalidades em aberto, encargos contratuais, danos materiais, despesas extraordinárias imputáveis ao(à) HÓSPEDE e demais prejuízos comprovadamente decorrentes do inadimplemento ou descumprimento contratual.

**4.7** Na hipótese de desistência imotivada pelo(a) HÓSPEDE após a assinatura deste contrato, inclusive quando ocorrida antes da efetiva entrada na unidade, poderá a CONTRATADA reter total ou parcialmente a garantia para compensação dos valores devidos e dos prejuízos financeiros decorrentes da desistência, inclusive a primeira mensalidade não paga, o período de bloqueio da unidade e a vacância superveniente.

**4.8** Caso a desistência seja comunicada em prazo inferior a 30 (trinta) dias da data prevista para início da hospedagem, fica desde já ajustado que a garantia poderá ser apropriada, no mínimo, até o limite do valor da primeira mensalidade, sem prejuízo da cobrança complementar de eventual diferença, caso os prejuízos efetivamente apurados superem o valor depositado.

**4.9** Na hipótese de pagamento antecipado parcial com finalidade de confirmação de reserva, eventual devolução, compensação ou retenção do valor observará as disposições contratuais aplicáveis à desistência, inclusive quanto aos prejuízos financeiros decorrentes do bloqueio da unidade, vacância superveniente e demais efeitos do descumprimento contratual.

**4.10** Havendo utilização parcial ou total da garantia durante a vigência contratual, o(a) HÓSPEDE deverá recompor o valor respectivo no prazo de 5 (cinco) dias úteis, sob pena de caracterização de inadimplemento contratual.

**4.11** Encerrada a hospedagem e inexistindo pendências financeiras, danos ou prejuízos imputáveis ao(à) HÓSPEDE, o valor remanescente da garantia será restituído em até 30 (trinta) dias.

**4.12** A garantia contratual também poderá ser utilizada para compensação dos valores devidos em razão da inobservância do aviso prévio de 30 (trinta) dias para rescisão antecipada por iniciativa do(a) HÓSPEDE, inclusive para cobertura da mensalidade correspondente ao período não avisado, sem prejuízo de outros prejuízos comprovadamente suportados pela CONTRATADA.

## CLÁUSULA 5 – OCUPAÇÃO E VEDAÇÕES

A hospedagem é individual, sendo expressamente vedada a permanência habitual de terceiros, crianças ou núcleo familiar.

**5.1** É vedada a subcessão, empréstimo ou compartilhamento do quarto, bem como a cessão da vaga, da unidade, das chaves, cartões, tags, códigos de acesso, senhas, credenciais digitais ou quaisquer meios de ingresso a terceiros.

**5.2** É igualmente vedada a fixação do endereço como domicílio fiscal, comercial ou empresarial.

**5.3** Também é vedado ao(à) HÓSPEDE: (i) receber hóspedes ou pernoites sem autorização prévia e escrita da CONTRATADA; (ii) guardar bens de terceiros de forma habitual; (iii) alterar fechaduras, equipamentos, móveis, instalações, roteadores, senhas de Wi-Fi ou qualquer sistema de acesso sem autorização; (iv) utilizar a unidade para atividade profissional presencial, gravações, atendimentos, produção de conteúdo comercial, armazenamento de mercadorias ou finalidade diversa da hospedagem; e (v) praticar condutas incompatíveis com a convivência, segurança, salubridade e tranquilidade da operação de coliving.

**5.4** O(A) HÓSPEDE obriga-se a observar as regras de silêncio, segurança, convivência e uso adequado das áreas privativas e comuns, respondendo pelos atos praticados por pessoas por ela autorizadas a ingressar na unidade ou nas dependências do empreendimento.

**5.5** O(A) HÓSPEDE compromete-se a respeitar a modalidade da hospedagem contratada, abstendo-se de praticar condutas incompatíveis com a organização da unidade, com a privacidade dos demais ocupantes, com a destinação operacional dos espaços e com as diretrizes internas estabelecidas pela CONTRATADA para cada modalidade de moradia.

## CLÁUSULA 6 – REGULAMENTO INTERNO

O Regulamento Interno integra o presente contrato como Anexo I.

**6.1** O descumprimento reiterado ou grave das normas de convivência, segurança, uso das áreas comuns, silêncio, limpeza, integridade do patrimônio ou qualquer outra obrigação operacional constitui infração contratual, autorizando a rescisão.

**6.2** A CONTRATADA poderá atualizar o Regulamento Interno por razões operacionais, de segurança, manutenção, organização da operação ou boa convivência, mediante comunicação prévia à HÓSPEDE, passando a nova versão a integrar o presente contrato a partir da ciência da HÓSPEDE.

**6.3** O Regulamento Interno poderá estabelecer regras específicas aplicáveis a cada modalidade de hospedagem, inclusive quanto à organização dos espaços, convivência, circulação de visitantes, uso de áreas comuns, rotinas operacionais e medidas de segurança, obrigando-se o(a) HÓSPEDE ao seu integral cumprimento.

## CLÁUSULA 7 – RESCISÃO

O contrato poderá ser rescindido por: (i) inadimplemento; (ii) descumprimento contratual; (iii) infração ao regulamento interno; (iv) término do prazo contratual; (v) desistência imotivada da HÓSPEDE, ainda que anterior ao início da ocupação; (vi) prestação de informações falsas ou incompletas pela HÓSPEDE; (vii) prática de conduta incompatível com a natureza do coliving, a boa-fé, a segurança ou a convivência; (viii) violação grave das regras de uso da unidade ou das áreas comuns.

**7.1** Na hipótese de rescisão antecipada por iniciativa do(a) HÓSPEDE, este(a) deverá comunicar a CONTRATADA por escrito com antecedência mínima de 30 (trinta) dias da data pretendida para desocupação da unidade.

**7.2** O descumprimento do prazo de aviso prévio autorizará a CONTRATADA a reter ou compensar a garantia contratual, total ou parcialmente, para cobertura dos valores correspondentes ao período não avisado, sem prejuízo da cobrança de eventuais prejuízos adicionais devidamente apurados.

**7.3** Quando houver pagamento antecipado parcial com finalidade de confirmação de reserva, eventual devolução, compensação ou retenção do respectivo valor também observará as disposições contratuais aplicáveis à desistência, inclusive quanto aos prejuízos financeiros decorrentes do bloqueio da unidade, da vacância superveniente e dos demais efeitos do descumprimento contratual.

**7.4** Rescindido o contrato, o(a) HÓSPEDE deverá desocupar a unidade no prazo de até 48 (quarenta e oito) horas, salvo prazo diverso expressamente concedido pela CONTRATADA por escrito.

**7.5** A rescisão não impede a retenção ou compensação da garantia contratual, nem a adoção das medidas extrajudiciais ou judiciais cabíveis para cobrança de valores devidos, reparação de danos, retomada da unidade e remoção de bens remanescentes.

**7.6** A permanência do(a) HÓSPEDE na unidade após o prazo de desocupação caracterizará ocupação irregular, aplicando-se o disposto na Cláusula 3, sem prejuízo de outras medidas cabíveis.

## CLÁUSULA 8 – COMPLIANCE E LGPD

As partes comprometem-se ao cumprimento da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados).

**8.1** Os dados pessoais do(a) HÓSPEDE poderão ser tratados pela CONTRATADA para execução contratual, cumprimento de obrigações legais e regulatórias, cadastro interno, segurança da operação, prevenção a fraudes, proteção do crédito, controle de acesso, gestão administrativa, organização da hospedagem, verificação de identidade, apuração de responsabilidades e defesa em processos administrativos, extrajudiciais ou judiciais.

**8.2** O(A) HÓSPEDE declara ciência de que o tratamento de dados observará a finalidade, necessidade e adequação inerentes à operação da CONTRATADA e à regular execução deste contrato.

## CLÁUSULA 9 – MEDIAÇÃO E FORO

As partes comprometem-se a buscar solução consensual para controvérsias decorrentes deste contrato, preferencialmente por negociação direta ou mediação.

**9.1** A tentativa de solução consensual não impedirá a adoção imediata de medidas urgentes, cautelares, extrajudiciais ou judiciais pela CONTRATADA, especialmente em caso de inadimplemento, ocupação irregular, risco ao patrimônio, descumprimento grave das regras operacionais, segurança ou necessidade de retomada da unidade.

**9.2** Fica eleito o foro da comarca do imóvel para dirimir eventuais controvérsias.

## CLÁUSULA 10 – VINCULAÇÃO AO CONTRATO PRINCIPAL

A hospedagem extinguir-se-á automaticamente caso a CONTRATADA perca a posse legítima do imóvel em razão do término, rescisão, denúncia, resolução ou qualquer outra forma de extinção do contrato principal que legitima sua operação na unidade.

**10.1** Nessa hipótese, a extinção da hospedagem não gerará ao(à) HÓSPEDE direito de retenção, indenização, permanência, reacomodação compulsória ou qualquer pretensão de natureza possessória ou locatícia em face da CONTRATADA.

**10.2** O(A) HÓSPEDE deverá desocupar a unidade no prazo indicado pela CONTRATADA, observado prazo razoável compatível com a situação concreta, sem prejuízo da possibilidade de realocação facultativa para outra unidade, se houver disponibilidade e interesse exclusivo da CONTRATADA.

{{local_data}}

__________________________________
HÓSPEDE

__________________________________
T.K. PIMENTA MOREIRA – LARTINAS RAÍZES COMPARTILHADAS
Tatiana Kelly Pimenta Moreira

---

## ANEXO I – CHECKLIST DE VISTORIA E INVENTÁRIO

Descrição detalhada do quarto, mobiliário, eletrodomésticos, enxoval, utensílios, chaves, cartões, controles, itens de decoração e respectivo estado de conservação, preferencialmente com registro fotográfico e campo para observações do(a) HÓSPEDE.

| Item | Descrição / Quantidade | Estado de conservação | Observações |
|------|------------------------|-----------------------|-------------|
| Quarto / mobiliário | | | |
| Enxoval | | | |
| Utensílios / eletros | | | |
| Chaves / tags / controles | | | |

## ANEXO II – TERMO DE ENTREGA DE CHAVES E INGRESSO NA UNIDADE

Declaro que recebi as chaves, tags, controles, senhas e a unidade nas condições descritas no checklist de vistoria e inventário, bem como tomei ciência do Regulamento Interno e das regras de uso aplicáveis à hospedagem.

| Campo | Informação |
|-------|------------|
| Data da entrega | |
| Hora da entrega | |
| Quantidade de chaves/tags | |
| Confirmação de recebimento do Regulamento Interno | ( ) Sim ( ) Não |
| Observações iniciais do(a) HÓSPEDE | |

### DECLARAÇÃO DE CIÊNCIA DA MODALIDADE CONTRATADA

O(A) HÓSPEDE declara que:
- leu integralmente este contrato;
- tem ciência da modalidade de hospedagem assinalada no quadro inicial;
- compreende as características próprias da operação de coliving da CONTRATADA;
- compromete-se a observar integralmente as regras contratuais e o Regulamento Interno.

Assinatura do(a) HÓSPEDE: ___________________________________

{{local_data}}
$TPL$, true),

('Contrato de Prestação de Serviços Operacionais - Proprietário (Modelo Oficial)', 'proprietario', $TPL$
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS OPERACIONAIS E APOIO À DISPONIBILIZAÇÃO DE UNIDADE RESIDENCIAL

Pelo presente instrumento particular, de um lado:

**PROPRIETÁRIO(A):** {{proprietario_nome}}, {{proprietario_nacionalidade}}, {{proprietario_estado_civil}}, {{proprietario_profissao}}, portador(a) do RG nº {{proprietario_rg}} e CPF nº {{proprietario_cpf}}, residente e domiciliado(a) em {{proprietario_endereco}}, doravante denominado(a) simplesmente PROPRIETÁRIO(A);

e, de outro lado:

**T.K. PIMENTA MOREIRA – LARTINAS RAÍZES COMPARTILHADAS**, empresária individual, inscrita no CNPJ sob o nº 58.518.384/0001-19, com sede na Rua Barão de Ipanema, nº 130, apto C02, Copacabana, Rio de Janeiro/RJ, neste ato representada por sua titular, Tatiana Kelly Pimenta Moreira, brasileira, solteira, empresária, inscrita no CPF sob o nº 080.504.506-60, doravante denominada simplesmente CONTRATADA;

têm entre si justo e contratado o presente **CONTRATO DE PRESTAÇÃO DE SERVIÇOS OPERACIONAIS E APOIO À DISPONIBILIZAÇÃO DE UNIDADE RESIDENCIAL**, que se regerá pelas cláusulas e condições seguintes.

## CLÁUSULA 1 – DO OBJETO

**1.1** O presente contrato tem por objeto a prestação, pela CONTRATADA, de serviços operacionais, materiais e de apoio relacionados à disponibilização e ao funcionamento da unidade residencial de titularidade do(a) PROPRIETÁRIO(A), situada em {{unidade_endereco}}, doravante denominada simplesmente UNIDADE.

**1.2** Os serviços objeto deste contrato compreendem, dentre outros compatíveis com sua natureza:
I. preparação da UNIDADE para uso e ocupação;
II. padronização operacional da UNIDADE;
III. apoio à divulgação da UNIDADE em canais autorizados;
IV. execução de rotinas operacionais relacionadas à entrada, permanência e saída de ocupantes;
V. acompanhamento operacional da utilização da UNIDADE;
VI. contratação, acompanhamento ou intermediação de limpeza, lavanderia, manutenção leve e reposição de itens;
VII. recebimento de valores por conta e ordem do(a) PROPRIETÁRIO(A), retenção dos valores expressamente previstos neste contrato e repasse do saldo apurado;
VIII. disponibilização de demonstrativos periódicos relacionados à operação da UNIDADE.

**1.3** As partes reconhecem que a CONTRATADA atua, no âmbito deste instrumento, como prestadora de serviços operacionais e de apoio, não se caracterizando, por este contrato, locação, sublocação, transferência da posse direta da UNIDADE à CONTRATADA, nem assunção, pela CONTRATADA, da condição de proprietária, locadora principal ou titular da unidade.

**1.4** O presente contrato não tem por objeto consultoria, planejamento empresarial, administração patrimonial ou gestão global de ativos, limitando-se aos serviços operacionais e de apoio expressamente previstos neste instrumento.

## CLÁUSULA 2 – DA UNIDADE

**2.1** A UNIDADE objeto deste contrato é a seguinte: {{unidade_descricao}}.

**2.2** O(a) PROPRIETÁRIO(A) declara, sob sua responsabilidade, que:
I. é legítimo titular da UNIDADE ou possui poderes suficientes para celebrar o presente contrato;
II. a UNIDADE encontra-se apta à disponibilização pretendida;
III. prestou à CONTRATADA informações verdadeiras, completas e suficientes sobre a UNIDADE;
IV. não omitiu restrições documentais, condominiais, estruturais ou operacionais relevantes.

**2.3** O(a) PROPRIETÁRIO(A) compromete-se a manter a CONTRATADA atualizada sobre qualquer alteração relevante relativa à UNIDADE, inclusive restrições de uso, questões condominiais, obras, notificações e fatos que possam impactar a execução dos serviços.

## CLÁUSULA 3 – DA DESTINAÇÃO E DO MODELO OPERACIONAL

**3.1** A UNIDADE será disponibilizada no modelo operacional adotado pela CONTRATADA, conforme ajustado entre as partes, permanecendo o(a) PROPRIETÁRIO(A) ciente de que a execução dos serviços observará os fluxos, padrões e procedimentos operacionais normalmente utilizados pela CONTRATADA.

**3.2** O(a) PROPRIETÁRIO(A) declara ciência de que a disponibilização da UNIDADE ocorrerá segundo os instrumentos e rotinas operacionais utilizados pela CONTRATADA junto aos ocupantes, sem que isso importe transferência da titularidade da unidade ou alteração da condição jurídica do(a) PROPRIETÁRIO(A).

## CLÁUSULA 4 – DOS SERVIÇOS DA CONTRATADA

**4.1** Sem prejuízo de outros serviços expressamente ajustados por escrito entre as partes, competirá à CONTRATADA:
1. executar providências operacionais para disponibilização da UNIDADE;
2. apoiar a divulgação da UNIDADE nos canais definidos para sua ocupação;
3. executar rotinas de entrada e saída de ocupantes;
4. prestar suporte operacional aos ocupantes durante a permanência;
5. providenciar, contratar ou acompanhar serviços acessórios de limpeza, lavanderia, manutenção leve e reposição de itens;
6. acompanhar a rotina operacional da UNIDADE;
7. consolidar informações financeiras da operação;
8. efetuar o repasse dos valores devidos ao(à) PROPRIETÁRIO(A), na forma deste contrato.

**4.2** A CONTRATADA poderá executar os serviços diretamente ou por meio de terceiros por ela selecionados, permanecendo responsável perante o(a) PROPRIETÁRIO(A) apenas pelos serviços que assumir neste contrato.

**4.3** A CONTRATADA não estará obrigada a realizar obras estruturais, regularizações documentais, regularizações condominiais, providências fiscais do(a) PROPRIETÁRIO(A), consultoria patrimonial ou atividades estranhas ao escopo operacional aqui previsto, salvo contratação escrita em separado.

## CLÁUSULA 5 – DOS ATOS NECESSÁRIOS À EXECUÇÃO DOS SERVIÇOS

**5.1** Para execução dos serviços contratados, o(a) PROPRIETÁRIO(A) autoriza a CONTRATADA a praticar, em seu nome e por sua conta e ordem, os atos estritamente necessários ao cumprimento deste instrumento, nos limites aqui previstos.

**5.2** Fica a CONTRATADA autorizada, especificamente, a:
1. apoiar a divulgação da UNIDADE nos canais definidos para sua ocupação;
2. operacionalizar contatos, reservas, entradas e saídas;
3. receber valores pagos pelos ocupantes, por conta e ordem do(a) PROPRIETÁRIO(A);
4. reter sua remuneração e as despesas operacionais autorizadas;
5. repassar ao(à) PROPRIETÁRIO(A) o saldo apurado;
6. contratar serviços acessórios necessários à rotina operacional ordinária da UNIDADE, nos limites financeiros previstos neste contrato;
7. adotar providências operacionais imediatas para preservação da utilização regular da UNIDADE.

**5.3** Dependem de autorização prévia e escrita do(a) PROPRIETÁRIO(A):
1. obras estruturais;
2. despesas extraordinárias superiores a R$ {{limite_despesas_extra}}, salvo urgência comprovada;
3. substituição de bens de valor superior a R$ {{limite_bens}};
4. alteração substancial do padrão da UNIDADE;
5. assunção de obrigações não previstas neste contrato em nome do(a) PROPRIETÁRIO(A).

## CLÁUSULA 6 – DAS OBRIGAÇÕES DO(A) PROPRIETÁRIO(A)

**6.1** Constituem obrigações do(a) PROPRIETÁRIO(A):
1. disponibilizar a UNIDADE em condições adequadas de uso;
2. fornecer à CONTRATADA todos os documentos, dados e informações necessários à execução dos serviços;
3. informar, de forma completa e verdadeira, restrições condominiais, limitações de uso, regras internas, pendências ou riscos relacionados à UNIDADE;
4. suportar os custos estruturais, extraordinários e aqueles que não se enquadrem como despesa operacional ordinária;
5. manter a regularidade documental, fiscal e condominial da UNIDADE;
6. responder por vícios ocultos, defeitos estruturais e problemas preexistentes da UNIDADE;
7. analisar e deliberar em tempo hábil sobre solicitações da CONTRATADA que dependam de sua autorização.

**6.2** A omissão, inexatidão ou atraso injustificado do(a) PROPRIETÁRIO(A) no cumprimento das obrigações acima poderá afastar ou mitigar a responsabilidade da CONTRATADA por impactos operacionais ou financeiros daí decorrentes.

## CLÁUSULA 7 – DAS OBRIGAÇÕES DA CONTRATADA

**7.1** Constituem obrigações da CONTRATADA:
I. prestar os serviços contratados com diligência, boa-fé e observância dos limites convencionados;
II. executar as rotinas operacionais necessárias à disponibilização da UNIDADE;
III. manter o(a) PROPRIETÁRIO(A) informado(a) sobre fatos relevantes da operação;
IV. realizar os repasses financeiros na forma e prazos ajustados;
V. disponibilizar demonstrativos periódicos da operação;
VI. comunicar ao(à) PROPRIETÁRIO(A), por escrito, em até 3 (três) dias úteis contados da ciência, a ocorrência de problema estrutural, vício, dano relevante ou necessidade de providência que extrapole o escopo operacional ordinário, ressalvadas as hipóteses de urgência, em que a comunicação deverá ser imediata ou no primeiro momento útil possível.

## CLÁUSULA 8 – DO FLUXO FINANCEIRO

**8.1** Os valores pagos pelos ocupantes da UNIDADE poderão ser recebidos pela CONTRATADA, por conta e ordem do(a) PROPRIETÁRIO(A), em conta de sua titularidade ou em meio de recebimento por ela operacionalizado.

**8.2** Para fins deste contrato, considera-se **receita total da UNIDADE** a totalidade dos valores efetivamente pagos pelos ocupantes em razão da utilização da unidade no período de referência, antes da dedução de despesas, taxas ou encargos operacionais.

**8.3** Dos valores recebidos, a CONTRATADA poderá reter, antes do repasse ao(à) PROPRIETÁRIO(A):
1. sua remuneração contratual, correspondente a **25% (vinte e cinco por cento)** da receita total da UNIDADE;
2. IPTU, cotas condominiais, contas de consumo e demais despesas da UNIDADE, somente na hipótese de adoção da Opção A prevista na Cláusula 10;
3. taxas de plataformas, meios de pagamento e intermediação operacional;
4. estornos, cancelamentos, chargebacks, reembolsos e ajustes operacionais efetivamente incidentes sobre o período;
5. outras quantias expressamente previstas neste instrumento ou previamente autorizadas por escrito pelo(a) PROPRIETÁRIO(A).

**8.4** O saldo líquido apurado será repassado ao(à) PROPRIETÁRIO(A) até o dia {{dia_repasse}} do mês subsequente ao da competência, acompanhado de demonstrativo discriminado das entradas, retenções, despesas e valores líquidos.

**8.5** Eventuais estornos, cancelamentos, reembolsos, chargebacks, inadimplência ou ajustes ocorridos após o fechamento de determinado período poderão ser lançados no demonstrativo do período em que efetivamente se materializarem.

**8.6** Para fins de apuração do saldo líquido a ser repassado ao(à) PROPRIETÁRIO(A), observar-se-á, sucessivamente, a seguinte ordem:
1. apuração da receita total da UNIDADE no período;
2. retenção da remuneração da CONTRATADA, na forma da Cláusula 9;
3. retenção das despesas da UNIDADE, quando cabível, na forma da Cláusula 10;
4. retenção de estornos, cancelamentos, chargebacks, reembolsos e ajustes operacionais incidentes sobre o período;
5. apuração do saldo líquido final a repassar ao(à) PROPRIETÁRIO(A).

## CLÁUSULA 9 – DA REMUNERAÇÃO DA CONTRATADA

**9.1** Pela prestação dos serviços previstos neste contrato, a CONTRATADA fará jus à remuneração correspondente a **25% (vinte e cinco por cento)** da receita total da UNIDADE, assim entendida na forma da Cláusula 8.2.

**9.2** A remuneração da CONTRATADA poderá ser retida diretamente dos valores recebidos por conta e ordem do(a) PROPRIETÁRIO(A), antes do repasse do saldo líquido.

**9.3** A remuneração prevista nesta cláusula remunera os serviços operacionais prestados pela CONTRATADA no âmbito deste instrumento, não se confundindo com aluguel, participação societária, comissão de venda ou remuneração por consultoria patrimonial.

## CLÁUSULA 10 – DAS DESPESAS DA UNIDADE

**10.1** As partes poderão adotar, para as despesas ordinárias e recorrentes vinculadas à UNIDADE, uma das seguintes sistemáticas, a ser expressamente assinalada no momento da contratação:
- ( ) Opção A – pagamento operacional pela CONTRATADA, com dedução no fluxo financeiro
- ( ) Opção B – pagamento direto pelo(a) PROPRIETÁRIO(A)

**10.2** Enquadram-se como despesas ordinárias e recorrentes da UNIDADE, para os fins deste contrato:
1. IPTU;
2. cotas condominiais, ordinárias e extraordinárias, salvo estipulação específica em contrário;
3. contas de consumo de água, energia elétrica, gás, internet, telefonia e serviços equivalentes;
4. despesas de limpeza;
5. despesas de lavanderia;
6. manutenção leve;
7. pequenos reparos compatíveis com a rotina operacional da unidade;
8. reposição de itens consumíveis;
9. taxas de plataformas e meios de pagamento;
10. outras despesas operacionais recorrentes relacionadas ao funcionamento da UNIDADE.

**10.3** Na hipótese de adoção da Opção A, caberá à CONTRATADA realizar o pagamento operacional das despesas referidas nesta cláusula, promovendo o respectivo lançamento no demonstrativo financeiro da competência e a dedução dos valores do montante a ser repassado ao(à) PROPRIETÁRIO(A).

**10.4** Na hipótese de adoção da Opção B, caberá ao(à) PROPRIETÁRIO(A) realizar diretamente o pagamento das despesas referidas nesta cláusula, responsabilizando-se pela sua quitação tempestiva, sem prejuízo do dever de fornecer à CONTRATADA, sempre que solicitado, os respectivos comprovantes ou informações necessárias à adequada execução operacional do contrato.

**10.5** Permanecerão de responsabilidade do(a) PROPRIETÁRIO(A), em qualquer hipótese, salvo ajuste diverso por escrito:
I. obras estruturais;
II. reformas de maior porte;
III. despesas decorrentes de vícios ocultos, defeitos estruturais ou problemas preexistentes;
IV. regularizações documentais, registrais, fiscais ou condominiais do imóvel que não integrem a rotina operacional da unidade;
V. substituição de bens de maior valor, quando não relacionada ao desgaste ordinário da operação.

**10.6** Despesas extraordinárias urgentes poderão ser realizadas pela CONTRATADA para preservar a integridade da UNIDADE, evitar agravamento de danos ou impedir prejuízo operacional relevante, devendo o(a) PROPRIETÁRIO(A) ser comunicado(a) imediatamente ou no primeiro momento útil possível, com posterior lançamento e demonstração no fluxo financeiro, observado o disposto neste contrato.

**10.7** A sistemática de pagamento de despesas escolhida pelas partes no item 10.1 integrará a presente contratação para todos os fins, somente podendo ser alterada por aditivo escrito firmado por ambas as partes.

## CLÁUSULA 11 – DA PRESTAÇÃO DE CONTAS

**11.1** A CONTRATADA disponibilizará ao(à) PROPRIETÁRIO(A), com periodicidade mensal, demonstrativo contendo, no mínimo:
I. valores recebidos no período;
II. retenções efetuadas;
III. despesas operacionais lançadas;
IV. remuneração da CONTRATADA;
V. saldo líquido repassado ou a repassar.

**11.2** O(a) PROPRIETÁRIO(A) poderá solicitar esclarecimentos ou impugnar, de forma específica e fundamentada, os lançamentos constantes do demonstrativo no prazo de 5 (cinco) dias úteis contados de seu recebimento, presumindo-se aceitos os itens não impugnados de forma expressa nesse prazo.

## CLÁUSULA 12 – DA CONSERVAÇÃO, MANUTENÇÃO E REPAROS

**12.1** A CONTRATADA acompanhará operacionalmente a conservação da UNIDADE, comunicando ao(à) PROPRIETÁRIO(A) a necessidade de reparos, reposições ou providências que extrapolem a manutenção leve ordinária.

**12.2** Reparos estruturais, vícios ocultos, infiltrações, defeitos elétricos ou hidráulicos relevantes e demais problemas cuja origem não decorra da rotina ordinária da unidade serão de responsabilidade do(a) PROPRIETÁRIO(A).

**12.3** Pequenos reparos e manutenção leve necessários à rotina operacional da UNIDADE poderão ser providenciados diretamente pela CONTRATADA, independentemente de consulta prévia ao(à) PROPRIETÁRIO(A), até o limite global de R$ 500,00 (quinhentos reais) por mês, não cumulativo para competências subsequentes. Ultrapassado esse limite, será necessária autorização prévia e escrita do(a) PROPRIETÁRIO(A), ressalvadas as hipóteses de urgência devidamente justificadas, em que a CONTRATADA poderá adotar as providências necessárias para evitar agravamento de danos ou prejuízo operacional relevante, com posterior comunicação e demonstração dos custos.

## CLÁUSULA 13 – DA NATUREZA DA ATUAÇÃO DA CONTRATADA

**13.1** As partes reconhecem que a atuação da CONTRATADA, no âmbito deste instrumento, limita-se à prestação de serviços operacionais, materiais e de apoio relacionados à disponibilização e ao funcionamento da UNIDADE.

**13.2** A CONTRATADA não assume, por este contrato, obrigação de administração patrimonial, consultoria empresarial, planejamento estratégico do patrimônio do(a) PROPRIETÁRIO(A) ou direção global da atividade econômica relacionada ao imóvel.

## CLÁUSULA 14 – DA VIGÊNCIA E DA RESCISÃO

**14.1** O presente contrato vigorará por {{prazo_meses}} meses, com início em {{data_inicio}}, podendo ser renovado mediante acordo escrito entre as partes.

**14.2** Qualquer das partes poderá resilir o presente contrato mediante notificação escrita com antecedência mínima de 30 (trinta) dias.

**14.3** Em caso de rescisão, a CONTRATADA permanecerá responsável, até a data efetiva de encerramento operacional, apenas:
1. pela conclusão das rotinas operacionais já em curso;
2. pela prestação de contas final;
3. pelo repasse de valores ainda devidos;
4. pelo encerramento ou transferência dos canais operacionais vinculados à UNIDADE, conforme ajustado entre as partes.

**14.4** Na hipótese de rescisão, as partes definirão por escrito o tratamento das ocupações já contratadas, podendo:
1. mantê-las até seu encerramento regular;
2. interromper novas disponibilizações a partir do aviso de rescisão;
3. estabelecer procedimento de transição operacional;
4. disciplinar a destinação dos valores recebidos, despesas incorridas e remuneração devida até a data de encerramento efetivo da atuação da CONTRATADA.

**14.5** O inadimplemento contratual relevante por qualquer das partes, não sanado em até 10 (dez) dias úteis contados do recebimento de notificação escrita, autorizará a parte adimplente a rescindir o contrato, sem prejuízo das perdas e danos cabíveis.

## CLÁUSULA 14-A – DA RESILIÇÃO IMOTIVADA PELO(A) PROPRIETÁRIO(A)

**14-A.1** Na hipótese de resilição imotivada deste contrato por iniciativa do(a) PROPRIETÁRIO(A), sem justa causa atribuível à CONTRATADA, será devida à CONTRATADA, a título de compensação pela captação, estruturação operacional, disponibilização da UNIDADE e manutenção da ocupação em curso, quantia correspondente a **50% (cinquenta por cento)** da remuneração que lhe seria devida sobre os contratos de ocupação ativos na data da notificação de resilição, considerada a remuneração contratual prevista na Cláusula 9 e o período remanescente de vigência de cada instrumento então em curso.

**14-A.2** Para os fins desta cláusula, consideram-se contratos de ocupação ativos aqueles já formalizados e vigentes na data da comunicação escrita de resilição, ainda que sua execução se projete para além da data de encerramento da atuação da CONTRATADA.

**14-A.3** A compensação prevista nesta cláusula será apurada com base:
1. na remuneração contratual da CONTRATADA, correspondente a 25% (vinte e cinco por cento) da receita total da UNIDADE;
2. na receita contratada para cada ocupação ativa ou, quando houver variação, na receita estimada com base nos valores ajustados no respectivo instrumento;
3. no período remanescente de cada contrato de ocupação ativo na data da notificação de resilição.

**14-A.4** O valor da compensação prevista nesta cláusula deverá ser apurado pela CONTRATADA em demonstrativo próprio e poderá ser:
1. compensado com créditos eventualmente existentes em favor do(a) PROPRIETÁRIO(A), quando suficientes; ou
2. pago diretamente pelo(a) PROPRIETÁRIO(A), no prazo de 10 (dez) dias úteis contados do recebimento do demonstrativo.

**14-A.5** A compensação prevista nesta cláusula não será devida:
1. se a resilição decorrer de justa causa atribuível à CONTRATADA;
2. se inexistirem contratos de ocupação ativos na data da notificação de resilição;
3. se houver acordo escrito entre as partes dispondo de forma diversa.

## CLÁUSULA 14-B – DA CONTINUIDADE DAS OCUPAÇÕES CAPTADAS APÓS A RESILIÇÃO

**14-B.1** Na hipótese de resilição imotivada por iniciativa do(a) PROPRIETÁRIO(A), sem justa causa atribuível à CONTRATADA, a manutenção, renovação, prorrogação, substituição ou contratação direta, pelo(a) PROPRIETÁRIO(A), de ocupantes captados, operacionalizados ou inseridos na UNIDADE pela CONTRATADA durante a vigência deste contrato não afastará o direito da CONTRATADA à compensação prevista na Cláusula 14-A.

**14-B.2** A permanência do ocupante na UNIDADE, a celebração de novo instrumento com o mesmo ocupante, ou a continuidade da relação contratual diretamente entre o(a) PROPRIETÁRIO(A) e o ocupante após a resilição, não descaracterizarão a origem da captação realizada pela CONTRATADA para os fins desta compensação.

## CLÁUSULA 15 – DA RESPONSABILIDADE

**15.1** A CONTRATADA responderá apenas pelos danos diretos comprovadamente decorrentes de falha na prestação dos serviços que lhe incumbam por este contrato.

**15.2** A CONTRATADA não responderá por:
1. vícios estruturais ou preexistentes da UNIDADE;
2. atos praticados diretamente pelo(a) PROPRIETÁRIO(A);
3. prejuízos decorrentes de informações incompletas, incorretas ou omitidas pelo(a) PROPRIETÁRIO(A);
4. restrições condominiais ou documentais não previamente informadas;
5. caso fortuito, força maior ou fatos de terceiros alheios à sua atuação.

**15.3** O(a) PROPRIETÁRIO(A) responderá pelos danos, custos e prejuízos decorrentes de irregularidade da UNIDADE, de omissão relevante ou de descumprimento de obrigação que lhe caiba por este contrato.

## CLÁUSULA 16 – DA INADIMPLÊNCIA E DOS DANOS CAUSADOS POR OCUPANTES

**16.1** A CONTRATADA não garante a adimplência dos ocupantes da UNIDADE, não assumindo, por este contrato, obrigação de pagamento, antecipação, cobertura ou recomposição de valores que deixem de ser pagos pelos ocupantes ao(à) PROPRIETÁRIO(A).

**16.2** A CONTRATADA também não responderá, como devedora principal, por danos materiais, prejuízos ou obrigações imputáveis aos ocupantes da UNIDADE, salvo se tais danos decorrerem comprovadamente de falha própria da CONTRATADA na prestação dos serviços assumidos neste contrato ou de ato praticado por ela com culpa ou dolo.

**16.3** Verificada inadimplência de ocupante ou ocorrência de dano imputável a ocupante da UNIDADE, caberá à CONTRATADA adotar as providências operacionais cabíveis no âmbito de sua atuação, inclusive comunicação ao(à) PROPRIETÁRIO(A), registro da ocorrência, cobrança extrajudicial e outras medidas compatíveis com os poderes recebidos, sem que isso implique assunção, pela CONTRATADA, da obrigação financeira correspondente.

**16.4** Os valores não recebidos, os prejuízos causados por ocupantes e os custos de recomposição ou cobrança poderão ser lançados no fluxo financeiro da UNIDADE quando houver recuperação parcial ou total, sem prejuízo das medidas cabíveis diretamente pelo(a) PROPRIETÁRIO(A), na qualidade de parte contratante principal perante o ocupante.

## CLÁUSULA 17 – DA CONFIDENCIALIDADE

**17.1** As partes comprometem-se a manter sigilo sobre informações comerciais, operacionais, financeiras e documentais a que tiverem acesso em razão deste contrato, não podendo divulgá-las a terceiros sem autorização da outra parte, salvo por exigência legal, regulatória ou ordem de autoridade competente.

## CLÁUSULA 18 – DAS NOTIFICAÇÕES

**18.1** Toda comunicação entre as partes será feita por escrito, inclusive por correio eletrônico ou aplicativo de mensagens, desde que passível de comprovação.

**18.2** Considerar-se-ão válidos, até comunicação formal em sentido diverso, os seguintes contatos:

PROPRIETÁRIO(A): {{proprietario_contato}}
E-mail: {{proprietario_email}}
WhatsApp: {{proprietario_whatsapp}}

CONTRATADA: Lartinas Raízes Compartilhadas
E-mail: contato@lartinas.com.br
WhatsApp: (21) ____-____

## CLÁUSULA 19 – DAS DISPOSIÇÕES GERAIS

**19.1** O presente contrato não estabelece sociedade, associação, vínculo trabalhista, mandato geral, representação comercial exclusiva ou qualquer forma de comunhão patrimonial entre as partes.

**19.2** A eventual tolerância de uma parte para com a outra não importará em novação, renúncia ou alteração tácita das disposições contratuais.

**19.3** A nulidade ou inexequibilidade de qualquer cláusula não prejudicará a validade das demais.

**19.4** Integram este contrato, se houver:
1. Anexo I – Descrição da Unidade e Inventário Inicial;
2. Anexo II – Tabela de Despesas Operacionais Ordinárias;
3. Anexo III – Regras Financeiras e de Repasse;
4. Anexo IV – Instrumento de poderes específicos, se aplicável.

## CLÁUSULA 20 – DO FORO

**20.1** Fica eleito o foro da Comarca de {{foro_comarca}}, com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer controvérsias oriundas deste contrato.

E, por estarem justas e contratadas, firmam o presente instrumento em 2 (duas) vias de igual teor e forma, juntamente com duas testemunhas.

{{local_data}}

__________________________________
PROPRIETÁRIO(A)

__________________________________
T.K. PIMENTA MOREIRA – LARTINAS RAÍZES COMPARTILHADAS
Tatiana Kelly Pimenta Moreira

__________________________________
Testemunha 1 — Nome: __________ CPF: __________

__________________________________
Testemunha 2 — Nome: __________ CPF: __________

---

## ANEXO I – DESCRIÇÃO DA UNIDADE E INVENTÁRIO INICIAL

**1. Identificação da Unidade**
- Endereço: {{unidade_endereco}}
- Complemento: {{unidade_complemento}}
- Cidade/UF: {{unidade_cidade_uf}}
- CEP: {{unidade_cep}}
- Matrícula: {{unidade_matricula}}
- Vaga de garagem: {{unidade_garagem}}
- Depósito: {{unidade_deposito}}

**2. Estado Geral da Unidade na Data de Início da Vigência**
O(a) PROPRIETÁRIO(A) declara que a UNIDADE é entregue à CONTRATADA em condições adequadas de uso, limpeza, funcionamento e disponibilização, ressalvadas as observações expressamente registradas neste Anexo.

**3. Inventário Inicial** — Sala / Quartos / Cozinha / Banheiros / Lavanderia / Itens adicionais (a preencher).

**4. Observações sobre Estado de Conservação** — [Inserir observações sobre pintura, revestimentos, instalações, avarias preexistentes etc.]

**5. Registros Fotográficos** — Poderão integrar este Anexo registros fotográficos da UNIDADE.

---

## ANEXO II – TABELA DE DESPESAS OPERACIONAIS ORDINÁRIAS

Despesas operacionais ordinárias da UNIDADE: IPTU; cotas condominiais; água; energia elétrica; gás; internet; telefonia; limpeza; lavanderia; manutenção leve; pequenos reparos; reposição de itens consumíveis; taxas de plataformas; taxas de meios de pagamento; demais despesas operacionais.

Pequenos reparos e manutenção leve até R$ 500,00 (quinhentos reais) por mês, não cumulativo.

---

## ANEXO III – REGRAS FINANCEIRAS E DE REPASSE

1. **Receita total da UNIDADE:** totalidade dos valores efetivamente pagos pelos ocupantes no período, antes de deduções.
2. **Remuneração da CONTRATADA:** 25% (vinte e cinco por cento) da receita total da UNIDADE.
3. **Ordem de apuração:** (I) receita total; (II) remuneração da CONTRATADA; (III) despesas da UNIDADE; (IV) estornos/ajustes; (V) saldo líquido.
4. **Data de repasse:** até o dia {{dia_repasse}} do mês subsequente.
5. **Forma de repasse:** {{forma_repasse}} — Banco {{banco}}, Ag. {{agencia}}, Conta {{conta}}, Titular {{titular}}, CPF/CNPJ {{cpf_cnpj}}, PIX {{chave_pix}}.
6. **Prestação de contas:** demonstrativo mensal com recebidos, retenções, despesas, remuneração e saldo líquido.
7. **Impugnação:** prazo de 5 (cinco) dias úteis, sob pena de aceite tácito.
8. **Ajustes posteriores:** estornos, reembolsos, chargebacks e inadimplências poderão ser lançados na competência em que se materializarem.

---

## ANEXO IV – PROCURAÇÃO / INSTRUMENTO DE PODERES ESPECÍFICOS

**OUTORGANTE:** {{proprietario_nome}}, {{proprietario_nacionalidade}}, {{proprietario_estado_civil}}, {{proprietario_profissao}}, RG nº {{proprietario_rg}}, CPF nº {{proprietario_cpf}}, residente em {{proprietario_endereco}}.

**OUTORGADA:** T.K. PIMENTA MOREIRA - LARTINAS RAÍZES COMPARTILHADAS, CNPJ 58.518.384/0001-19, representada por Tatiana Kelly Pimenta Moreira, CPF 080.504.506-60.

Pelo presente instrumento, o(a) OUTORGANTE confere à OUTORGADA poderes específicos, relativamente à unidade situada em {{unidade_endereco}}, para:
I. divulgar a unidade em canais físicos ou digitais;
II. manter contatos com interessados na ocupação;
III. receber propostas, reservas e solicitações;
IV. assinar, em nome do(a) OUTORGANTE, contratos, termos e recibos relacionados à ocupação, nos parâmetros do contrato principal;
V. receber valores pagos pelos ocupantes, por conta e ordem do(a) OUTORGANTE;
VI. reter remuneração contratualmente devida, despesas autorizadas e demais valores previstos no contrato principal;
VII. repassar os valores líquidos apurados;
VIII. contratar serviços acessórios de limpeza, lavanderia, manutenção leve, reposição e apoio operacional;
IX. praticar atos operacionais urgentes para preservação da unidade;
X. representar o(a) OUTORGANTE perante ocupantes, fornecedores e prestadores, exclusivamente para fins operacionais;
XI. tratar, em nome do(a) OUTORGANTE, com o condomínio, administradora, síndico e portaria, para fins operacionais, vedada a assunção de obrigações extraordinárias ou renúncia de direitos sem autorização expressa.

**Limites:** a procuração NÃO confere poderes para alienar/onerar a unidade, firmar financiamento, novação, confissão de dívida, renúncia, obras estruturais sem autorização, atos estranhos ao contrato principal ou substabelecimento amplo.

**Vinculação:** acessória ao contrato principal, vigorando pelo mesmo prazo e extinguindo-se com ele, salvo revogação expressa anterior.

{{local_data}}

__________________________________
OUTORGANTE

__________________________________
OUTORGADA
$TPL$, true);