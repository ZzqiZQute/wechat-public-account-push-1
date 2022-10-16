import './index.css'
import * as marked from 'marked'
import domToImage from 'dom-to-image'

const generateImg = {}

function setMarkdownContent(markdownContent) {
  generateImg.markdownContent = markdownContent.split('\n').map((it) => it.trim()).join('\n')
}

function setWidth(width) {
  generateImg.width = width
}

function setFontSize(fontSize) {
  generateImg.fontSize = fontSize
}

function setPadding(padding) {
  generateImg.padding = padding
}

function injectStyle(style) {
  generateImg.style = style
}

function render() {
  return new Promise((resolve) => {
    const div = document.createElement('div')
    div.innerHTML = marked.parse(generateImg.markdownContent)
    const app = document.querySelector('#app')
    app.style.width = `${generateImg.width}px`
    app.style.fontSize = `${generateImg.fontSize}px`
    app.style.padding = `0 ${generateImg.padding}px`
    if (generateImg.style) {
      const style = document.createElement('style')
      style.innerHTML = generateImg.style
      document.head.appendChild(style)
    }
    app.appendChild(div)
    const task = () => {
      const imgList = Array.from(document.querySelectorAll('img'))
      const handler = () => {
        if (imgList.every((it) => it.complete)) {
          domToImage.toPng(document.querySelector('#app'), {})
            .then(resolve)
            .catch((error) => {
              console.error('oops, something went wrong!', error)
            })
        } else {
          setTimeout(handler)
        }
      }
      handler()
    }
    document.fonts.ready.finally(task)
  })
}

window.setMarkdownContent = setMarkdownContent
window.setWidth = setWidth
window.render = render
window.setFontSize = setFontSize
window.setPadding = setPadding
window.injectStyle = injectStyle
