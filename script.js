// Iniciando o SignaturePad para as assinaturas
const signaturePadPassed = new SignaturePad(document.getElementById('signature-pad-passed'));
const signaturePadReceived = new SignaturePad(document.getElementById('signature-pad-received'));

// Limpar assinatura
document.getElementById('clear-signature-passed').addEventListener('click', () => signaturePadPassed.clear());
document.getElementById('clear-signature-received').addEventListener('click', () => signaturePadReceived.clear());

document.getElementById("generate-pdf").addEventListener("click", async function () {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    let yPos = 20;
    const lineHeight = 8;

    // Obter a data atual e o turno selecionado
    const turno = document.getElementById("turno").value;
    const dataAtual = new Date();
    const dataFormatadaAtual = `${String(dataAtual.getDate()).padStart(2, '0')}/${String(dataAtual.getMonth() + 1).padStart(2, '0')}/${dataAtual.getFullYear()}`;
    const tituloPDF = `${dataFormatadaAtual}_${turno}`;

    // Função para formatar datas no padrão DD/MM/AAAA
    function formatarData(dataString) {
        const [ano, mes, dia] = dataString.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    // Adicionar título principal
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Passagem de Plantão", pdf.internal.pageSize.getWidth() / 2, yPos, { align: "center" });
    yPos += lineHeight * 2;

    function addTitle(title) {
        const pageHeight = 280;
        if (yPos > pageHeight - lineHeight) {
            pdf.addPage();
            yPos = 20;
        }
        yPos += lineHeight; // Espaço extra antes do título
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, 10, yPos, { maxWidth: 180, align: "left" });
        yPos += lineHeight * 2; // Maior espaçamento após o título
    }

    function addText(label, text) {
        const pageHeight = 280;
        const maxLineWidth = 180;
        const textLines = pdf.splitTextToSize(`${label}: ${text || "Não preenchido"}`, maxLineWidth);

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        textLines.forEach(line => {
            if (yPos > pageHeight) {
                pdf.addPage();
                yPos = 20;
            }
            pdf.text(line, 10, yPos);
            yPos += lineHeight;
        });
    }

    async function addSignature(canvasId, label) {
        const canvas = document.getElementById(canvasId);
        const signatureImage = canvas.toDataURL("image/png");
        if (signatureImage) {
            if (yPos > 230) {
                pdf.addPage();
                yPos = 20;
            }
            pdf.setFontSize(12);
            pdf.text(`${label}:`, 10, yPos);
            yPos += 5;
            pdf.addImage(signatureImage, "PNG", 10, yPos, 100, 40);
            yPos += 50;
        }
    }

    // Adicionando dados ao PDF
    addText("Contrato", document.getElementById("contrato").value);
    addText("Turno", turno);
    addText("Time", document.getElementById("time").value);
    addText("Data", dataFormatadaAtual); // Usando a data formatada

    addTitle("1. Efetivo Total no Plantão");
    addText("1.1 Trocas de Plantão", document.getElementById("trocas").value);
    addText("1.2 Hora Extra", document.getElementById("hora_extra").value);
    addText("1.3 Folga Programada", document.getElementById("folga").value);
    addText("1.4 Observações", document.getElementById("observacoes").value);

    addTitle("Atividade Preventiva");
    addText("Responsável 1", document.getElementById("responsavel1").value);
    addText("Responsável 2", document.getElementById("responsavel2").value);

    addTitle("Condutor");
    addText("Responsável 1", document.getElementById("condutor_responsavel1").value);
    addText("Responsável 2", document.getElementById("condutor_responsavel2").value);

    addTitle("Extsis/Estação");
    addText("Responsável 1", document.getElementById("estacao_responsavel1").value);
    addText("Responsável 2", document.getElementById("estacao_responsavel2").value);

    // Adicionando o título "Recados e Orientações" em negrito e o conteúdo normal
    addTitle("2. Recados e Orientações");
    const recadosOrientacoes = document.getElementById("recados_orientacoes").value;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const recadosLines = pdf.splitTextToSize(recadosOrientacoes || "Não preenchido", 180);
    recadosLines.forEach(line => {
        if (yPos > 280) {
            pdf.addPage();
            yPos = 20;
        }
        pdf.text(line, 10, yPos);
        yPos += lineHeight;
    });

    addTitle("3. Treinamentos Agendados");
    addText("Data", formatarData(document.getElementById("data_treinamento").value));
    addText("Local", document.getElementById("local_treinamento").value);
    addText("Horário", document.getElementById("hora_treinamento").value);
    addText("Matéria a ser Ministrada", document.getElementById("materia_treinamento").value);

    addTitle("4. Reconhecimento das Informações Registradas");
    addText("Bombeiro (Passado)", document.getElementById("bombeiro_passado").value);
    await addSignature("signature-pad-passed", "Assinatura (Passado)");
    addText("Hora", document.getElementById("hora_passado").value);
    addText("Bombeiro (Recebido)", document.getElementById("bombeiro_recebido").value);
    await addSignature("signature-pad-received", "Assinatura (Recebido)");
    addText("Hora", document.getElementById("hora_recebido").value);

    addTitle("5. Intercorrências Durante o Plantão Avisado");
    addText("Maurício Castelo", "(27) 99515-2627");
    addText("Jefferson Ferreira", "(27) 9988-6918");

    // Salvar o PDF com o título dinâmico
    pdf.save(`${tituloPDF}.pdf`);
});

function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

document.getElementById("clear-signature-passed").addEventListener("click", function () {
    clearCanvas("signature-pad-passed");
});
document.getElementById("clear-signature-received").addEventListener("click", function () {
    clearCanvas("signature-pad-received");
});
