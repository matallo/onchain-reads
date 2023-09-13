/** @type {import('next').NextConfig} */
module.exports = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/t/books",
        permanent: true,
      },
    ];
  },
};
