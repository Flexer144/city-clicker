export function formatNumber(value: number): string {
  if (value < 1000) return Math.floor(value).toString();

  // Массив суффиксов. Можно заменить на русские (тыс, млн, млрд, трлн), если хочешь!
  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  
  // Определяем, к какому десятку относится число (логарифм по основанию 10)
  const suffixIndex = Math.floor(Math.log10(value) / 3);
  
  // Если число больше, чем наш массив суффиксов, переводим в научный формат (1.5e33)
  if (suffixIndex >= suffixes.length) {
    return value.toExponential(2).replace('e+', 'e');
  }

  // Получаем короткое значение (например, 1500000 -> 1.5)
  const shortValue = value / Math.pow(1000, suffixIndex);
  
  // Оставляем 1 знак после запятой
  let formatted = shortValue.toFixed(2);
  
  // Убираем ".0" на конце (чтобы было "1M", а не "1.0M")
  if (formatted.endsWith(".00")) {
    formatted = formatted.slice(0, -3);
  }

  return formatted + suffixes[suffixIndex];
}