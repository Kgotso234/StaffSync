function generateEmpNumber(){
    const prefix = 2025;
    const random = Math.floor(100 + Math.random() * 900);

    return prefix + random ;
}

module.exports = generateEmpNumber;