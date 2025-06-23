const User = require('../models/relatorioModels');
const PdfPrinter = require('pdfmake');


exports.getAllUsers = (req, res) => {
    User.getAllUsers((users) => {
        if (!Array.isArray(users)) {
            console.error("Erro no retorno de getAllUsers há um erro.");
            return res.status(500).send("Erro ao buscar usuários.");
        }
        res.render("relatorio", { users });
    });
};


async function gerarPDF(users) {

    const fonts = {
        Roboto: {
            normal: 'node_modules/pdfmake/fonts/Roboto-Regular.ttf',
            bold: 'node_modules/pdfmake/fonts/Roboto-Bold.ttf',
            italics: 'node_modules/pdfmake/fonts/Roboto-Italic.ttf',
            bolditalics: 'node_modules/pdfmake/fonts/Roboto-BoldItalic.ttf',
        }
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
        content: [
            { text: 'Relatório de Clientes', style: 'header' },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', '*', '*'],
                    body: [
                        ['ID', 'Nome', 'Email', 'Data de Nascimento'],
                        ...users.map(user => [
                            user.id, 
                            user.name, 
                            user.email, 
                            new Date(user.dtnasc).toLocaleDateString('pt-BR')]),
                        
                    ],
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
            }
        }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];

    return new Promise((resolve, reject) => {
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);
        pdfDoc.end();
    });
}




exports.generatePDF = async (req, res) => {

    const users = await User.getAllUserstoPDF();
    const pdfBuffer = await gerarPDF(users);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; finalename=relatorio.pdf');
    res.send(pdfBuffer);

};