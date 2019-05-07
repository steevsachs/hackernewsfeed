module.exports = (api) => {
  const isTest = api.env('test')

  return {
    presets: [['react-app', { flow: false, typescript: false }]],
  }
}
