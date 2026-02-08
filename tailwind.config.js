/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Paleta principal
        'sf-primary': '#00809D',        // Cor principal - representa dinheiro
        'sf-primary-soft': '#E6F4F6',   // Variante suave da primária
        'sf-bg': '#FCF8DD',             // Background creme/bege
        'sf-accent': '#FFD700',         // Amarelo dourado vibrante
        'sf-gold': '#D3AF37',           // Dourado sofisticado
        // Cards e superfícies
        'sf-card': '#FFFFFF',           // Cards brancos (clean/minimalista)
        'sf-card-success': '#E8F5F0',   // Card verde suave (tem a receber)
        'sf-card-danger': '#FEF2F2',    // Card vermelho suave (deve)
        'sf-card-neutral': '#F0F9FA',   // Card neutro (quites)
        // Status
        'sf-success': '#00809D',        // Verde/teal para positivo (usa primária)
        'sf-danger': '#EF4444',         // Vermelho para dívidas
        // Texto
        'sf-text': '#111827',           // Texto principal
        'sf-muted': '#6B7280',          // Texto secundário
      },
      borderRadius: {
        '3xl': 30,
      },
      boxShadow: {
        'soft-lg': '0 16px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
