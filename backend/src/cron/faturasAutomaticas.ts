import cron from 'node-cron';
import prisma from '../lib/prisma'; 

export function iniciarCronJobs() {
  // Às 00:00h (0 0), no dia 1 (1), de Fevereiro a Novembro (2-11), em qualquer dia da semana (*)
  cron.schedule('0 0 1 2-11 *', async () => {
    console.log('A iniciar a geração automática de mensalidades...');
    
    try {
      const dataAtual = new Date();
      const mesAtualRaw = dataAtual.toLocaleString('pt-BR', { month: 'long' });
      const mesAtualFormatado = mesAtualRaw.charAt(0).toUpperCase() + mesAtualRaw.slice(1);
      const anoAtual = dataAtual.getFullYear();
      
      // Define a data de vencimento exata para o DIA 10
      const mesNumero = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const dataVencimento = `${anoAtual}-${mesNumero}-10`;

      // 1. Procura todos os alunos que estão com o status Ativo/Matriculado
      const alunosAtivos = await prisma.aluno.findMany({
        where: { status: 'Matriculado' },
        include: { user: true }
      });

      const valorMensalidade = 350.00; 

      for (const aluno of alunosAtivos) {
        // 2. Cria a Fatura no Banco de Dados
        await prisma.fatura.create({
          data: {
            alunoId: aluno.id,
            referencia: `Mensalidade - ${mesAtualFormatado}/${anoAtual}`,
            vencimento: dataVencimento,
            valor: valorMensalidade,
            status: 'Pendente'
          }
        });

        // 3. GATILHO DE NOTIFICAÇÃO
        await prisma.notificacao.create({
          data: {
            userId: aluno.user.id,
            titulo: "Nova Mensalidade Disponível",
            mensagem: `A sua mensalidade de ${mesAtualFormatado} já está disponível no seu painel financeiro. O vencimento é dia 10/${mesNumero}.`
          }
        });
      }

      console.log(`Sucesso! Foram geradas ${alunosAtivos.length} faturas para o mês de ${mesAtualFormatado}.`);
    } catch (error) {
      console.error('Erro crítico ao rodar o Cron Job de faturas:', error);
    }
  });
}