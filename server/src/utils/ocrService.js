import Tesseract from 'tesseract.js';

/**
 * Extract text from image using OCR
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromImage = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng',
            {
                logger: m => console.log(m) // Optional: log progress
            }
        );
        return text;
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to extract text from image');
    }
};

/**
 * Parse extracted text to extract order details
 * @param {string} text - Extracted text from OCR
 * @returns {Object} - Parsed order data
 */
const parseOrderSlip = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let clientName = '';
    let products = [];
    let oldBalance = 0;
    let totalAmount = 0;
    let currentSection = 'header'; // header, products, balance, total

    // Try to find client name (usually at the top)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        // Skip common header words
        if (!line.match(/^(bill|invoice|order|date|slip|no|number)/i)) {
            clientName = line;
            break;
        }
    }

    // Extract products, old balance, and total
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        
        // Look for old balance
        if (line.match(/(old|previous|balance|due|outstanding)/i)) {
            const balanceMatch = lines[i].match(/(\d+\.?\d*)/);
            if (balanceMatch) {
                oldBalance = parseFloat(balanceMatch[1]);
            }
        }
        
        // Look for total amount
        if (line.match(/(total|grand total|amount|sum)/i)) {
            const totalMatch = lines[i].match(/(\d+\.?\d*)/);
            if (totalMatch) {
                totalAmount = parseFloat(totalMatch[1]);
            }
        }
        
        // Try to extract product information
        // Pattern: Product name, quantity, price per unit, total
        const productPattern = /(.+?)\s+(\d+)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/;
        const productMatch = lines[i].match(productPattern);
        if (productMatch) {
            products.push({
                name: productMatch[1].trim(),
                quantity: parseInt(productMatch[2]),
                pricePerUnit: parseFloat(productMatch[3]),
                totalPrice: parseFloat(productMatch[4])
            });
        }
    }

    // Alternative parsing: if structured differently
    if (products.length === 0) {
        // Try to find numbers that might be quantities and prices
        for (let i = 0; i < lines.length; i++) {
            const numbers = lines[i].match(/\d+/g);
            if (numbers && numbers.length >= 2) {
                const productName = lines[i].replace(/\d+/g, '').trim();
                if (productName.length > 0) {
                    products.push({
                        name: productName,
                        quantity: parseInt(numbers[0]) || 1,
                        pricePerUnit: parseFloat(numbers[1]) || 0,
                        totalPrice: parseFloat(numbers[numbers.length - 1]) || 0
                    });
                }
            }
        }
    }

    return {
        clientName: clientName || '',
        products,
        oldBalance,
        totalAmount
    };
};

/**
 * Main function to process order slip image
 * @param {string} imagePath - Path to the uploaded image
 * @returns {Promise<Object>} - Extracted and parsed order data
 */
const processOrderSlip = async (imagePath) => {
    try {
        // Extract text using OCR
        const extractedText = await extractTextFromImage(imagePath);
        console.log('Extracted Text:', extractedText);
        
        // Parse the extracted text
        const parsedData = parseOrderSlip(extractedText);
        
        return {
            success: true,
            rawText: extractedText,
            data: parsedData
        };
    } catch (error) {
        console.error('Order slip processing error:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * Enhanced parsing with AI/ML approach using regex patterns
 * This function tries multiple patterns to extract data
 */
const enhancedParseOrderSlip = (text) => {
    const result = {
        clientName: '',
        products: [],
        oldBalance: 0,
        totalAmount: 0
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    // Pattern 1: Client name at the top (first non-empty line that doesn't look like a number or date)
    for (let i = 0; i < Math.min(3, lines.length); i++) {
        if (!lines[i].match(/^\d+/) && !lines[i].match(/\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/)) {
            result.clientName = lines[i];
            break;
        }
    }

    // Pattern 2: Extract products with various formats
    // Format 1: "Product Name Qty Price Total"
    // Format 2: "Product Name - Qty x Price = Total"
    // Format 3: "Product Name, Qty, Price, Total"
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip header lines
        if (line.match(/^(bill|invoice|order|date|name|product|qty|quantity|price|total|amount)/i)) {
            continue;
        }
        
        // Extract product information
        const patterns = [
            // Pattern: Name Quantity PricePerUnit TotalPrice
            /^(.+?)\s+(\d+)\s+(\d+\.?\d*)\s+(\d+\.?\d*)$/,
            // Pattern: Name - Quantity x Price = Total
            /^(.+?)\s*-\s*(\d+)\s*x\s*(\d+\.?\d*)\s*=\s*(\d+\.?\d*)$/i,
            // Pattern: Name, Quantity, Price, Total
            /^(.+?),\s*(\d+),\s*(\d+\.?\d*),\s*(\d+\.?\d*)$/,
        ];
        
        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                result.products.push({
                    name: match[1].trim(),
                    quantity: parseInt(match[2]),
                    pricePerUnit: parseFloat(match[3]),
                    totalPrice: parseFloat(match[4])
                });
                break;
            }
        }
        
        // Extract old balance
        if (line.match(/(old|previous|balance|due|outstanding|pending)/i)) {
            const balanceMatch = line.match(/(\d+\.?\d*)/);
            if (balanceMatch) {
                result.oldBalance = parseFloat(balanceMatch[1]);
            }
        }
        
        // Extract total amount
        if (line.match(/(total|grand total|amount|sum|payable)/i)) {
            const totalMatch = line.match(/(\d+\.?\d*)/);
            if (totalMatch) {
                result.totalAmount = parseFloat(totalMatch[1]);
            }
        }
    }

    return result;
};

export { processOrderSlip, extractTextFromImage, parseOrderSlip, enhancedParseOrderSlip };

