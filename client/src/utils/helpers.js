export const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #11998e, #38ef7d)',
    'linear-gradient(135deg, #f7971e, #ffd200)',
    'linear-gradient(135deg, #fc4a1a, #f7b733)',
    'linear-gradient(135deg, #2193b0, #6dd5ed)',
    'linear-gradient(135deg, #cc2b5e, #753a88)',
    'linear-gradient(135deg, #134e5e, #71b280)',
    'linear-gradient(135deg, #373b44, #4286f4)',
];

export function getGradient(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return gradients[hash % gradients.length];
}

export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
