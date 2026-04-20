const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigitsToWords(num: number) {
  if (num < 20) {
    return ONES[num];
  }
  const tensPart = Math.floor(num / 10);
  const onesPart = num % 10;
  return `${TENS[tensPart]}${onesPart ? ` ${ONES[onesPart]}` : ""}`.trim();
}

function threeDigitsToWords(num: number) {
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  const hundredPart = hundred ? `${ONES[hundred]} Hundred` : "";
  const remainderPart = remainder ? twoDigitsToWords(remainder) : "";
  return `${hundredPart}${hundredPart && remainderPart ? " " : ""}${remainderPart}`.trim();
}

export function amountToIndianWords(amount: number) {
  if (!Number.isFinite(amount) || amount < 0) {
    return "";
  }

  const rounded = Math.floor(amount);

  if (rounded === 0) {
    return "Zero Rupees Only";
  }

  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const rest = rounded % 1000;

  const parts: string[] = [];

  if (crore) {
    parts.push(`${threeDigitsToWords(crore)} Crore`);
  }
  if (lakh) {
    parts.push(`${threeDigitsToWords(lakh)} Lakh`);
  }
  if (thousand) {
    parts.push(`${threeDigitsToWords(thousand)} Thousand`);
  }
  if (rest) {
    parts.push(threeDigitsToWords(rest));
  }

  return `${parts.join(" ").replace(/\s+/g, " ").trim()} Rupees Only`;
}
