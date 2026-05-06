const PuppeteerHTMLPDF = require('../lib');
const hbs = require('handlebars');
const path = require('path');
const fs = require('fs').promises;

const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const width = 300;
const height = 200;
const chartCallback = (ChartJS) => {};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

async function generateChartBase64() {
  const configuration = {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        {
          label: 'Supply',
          data: [12, 19, 3, 5],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  };
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  return `data:image/png;base64,${image.toString('base64')}`;
}

async function createPDF(chartDOMBase64) {
  const htmlPDF = new PuppeteerHTMLPDF({ headless: false });
  const options = {
    format: 'A4',
    landscape: true,
    args: [
      '--allow-file-access-from-files',
      '--allow-file-access',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--js-flags=--max-old-space-size=8192',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu'
    ],
    protocolTimeout: 0 
  }
  htmlPDF.setOptions(options);

  const imagesDir = path.join(__dirname, 'images');
  
  let logoBase64 = '';
  let sloganBase64 = '';
  let slide1Base64 = '';
  let slide2Base64 = '';
  let slide3Base64 = '';
  let slide4Base64 = '';
  let slide10_1Base64 = '';
  let slide10_2Base64 = '';
  let slide12_img1Base64 = '';
  let slide12_img2Base64 = '';
  let slide13Base64 = '';
  let slide14Base64 = '';
  let slide13AvionSmBase64 = '';
  let logoSmBase64 = '';
  let stockSlide10Base64 = ''; 
  let checkSlide10Base64 = '';
  let dollarSignSlide10Base64 = '';
  let searchSlide10Base64 = '';
  
  try {
    try {
      await fs.access(imagesDir);
      //console.log('✅ Dossier images trouvé');
    } catch (error) {
      console.log('Le dossier images n\'existe pas à :', imagesDir);
      return;
    }

    const loadImage = async (filename) => {
  try {
    const fullPath = path.join(imagesDir, filename);

    const file = await fs.readFile(fullPath);
    const ext = path.extname(filename).substring(1);

    console.log(`${filename} chargé avec succès`);

    return `data:image/${ext};base64,${file.toString('base64')}`;

  } catch (error) {
    console.log(`Erreur chargement ${filename}:`, error.message);
    return '';
  }
};

    logoBase64 = await loadImage('logo.png', 'logoBase64');
    sloganBase64 = await loadImage('slogan.png', 'sloganBase64');
    slide1Base64 = await loadImage('slide1.jpg', 'slide1Base64');
    slide2Base64 = await loadImage('slide2.png', 'slide2Base64');
    slide3Base64 = await loadImage('slide3.png', 'slide3Base64');
    slide4Base64 = await loadImage('slide4.png', 'slide4Base64');
    slide10_1Base64 = await loadImage('slide10_1.png', 'slide10_1Base64');
    slide10_2Base64 = await loadImage('slide10_2.png', 'slide10_2Base64');
    slide12_img1Base64 = await loadImage('slide12_img1.png', 'slide12_img1Base64');
    slide12_img2Base64 = await loadImage('slide12_img2.png', 'slide12_img2Base64');
    slide13Base64 = await loadImage('slide13.png', 'slide13Base64');
    slide14Base64 = await loadImage('slide14.png', 'slide14Base64');
    slide13AvionSmBase64 = await loadImage('slide13-avion-sm.png', 'slide13AvionSmBase64');
    logoSmBase64 = await loadImage('logo-sm.png', 'logoSmBase64');
    stockSlide10Base64 = await loadImage('stock_slide10.png', 'stockSlide10Base64');
    checkSlide10Base64 = await loadImage('check_slide10.png', 'checkSlide10Base64');
    dollarSignSlide10Base64 = await loadImage('slide4_icone2.png', 'dollarSignSlide10Base64');
    searchSlide10Base64 = await loadImage('search_slide10.png', 'searchSlide10Base64');

  } catch (error) {
    console.log('Erreur lecture dossier images:', error.message);
  }

  const pdfData = {
    invoiceItems: [
      { item: 'Website Design', amount: 5000 },
      { item: 'Hosting (3 months)', amount: 2000 },
      { item: 'Domain (1 year)', amount: 1000 },
    ],
    invoiceData: {
      invoice_id: 123,
      transaction_id: 1234567,
      payment_method: 'Paypal',
      creation_date: '04-05-1993',
      total_amount: 8000,
    },
    baseUrl: 'https://ultimateakash.com',
    
    logoBase64,
    sloganBase64,
    slide1Base64,
    slide2Base64,
    slide3Base64,
    slide4Base64,
    slide10_1Base64,
    slide10_2Base64,
    slide12_img1Base64,
    slide12_img2Base64,
    slide13Base64,
    slide14Base64,
    chartDOMBase64, 
    slide13AvionSmBase64,
    logoSmBase64,
    stockSlide10Base64,
    checkSlide10Base64,
    dollarSignSlide10Base64,
    searchSlide10Base64
  }

  const html = await htmlPDF.readFile(__dirname + '/report_3.html', 'utf8');
  
  hbs.registerHelper('eq', function(a, b) {
    return a === b;
  });
  
  hbs.registerHelper('substr', function(str, start, length) {
    if (!str) return '';
    return str.substr(start, length) + '...';
  });
  
  const template = hbs.compile(html);
  const content = template(pdfData);

  try {
    const pdfBuffer = await htmlPDF.create(content, {
      waitUntil: 'load',
      timeout: 0 
    });
    
    const filePath = `${__dirname}/report_3.pdf`;
    await htmlPDF.writeFile(pdfBuffer, filePath);

    console.log("PDF généré avec succès :", filePath);
    
  } catch (error) {
    console.log('Erreur génération PDF :', error);
  }
}

async function main() {
  const chartBase64 = await generateChartBase64();
  await createPDF(chartBase64);
}
main(); 
//createPDF();