export function verifyAdminPassword(inputPassword, actualPassword) {
    // 安全地處理可能為 undefined 的參數
    if (!inputPassword || !actualPassword) return false;
    
    // 確保兩個參數都轉換為字串並進行比較
    const input = String(inputPassword || '').trim();
    const actual = String(actualPassword || '').trim();
    
    console.log('verifyAdminPassword - input:', `"${input}"`, 'actual:', `"${actual}"`);
    
    return input === actual;
}
