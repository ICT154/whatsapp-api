module.exports = {
    content: [
        "./test.html", // ⬅️ tambahkan ini
        "./views/**/*.ejs",
        "./app/**/*.js",
        "./public/**/*.html"
    ],
    safelist: ['btn', 'btn-primary', 'text-4xl', 'text-green-600'],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],
}