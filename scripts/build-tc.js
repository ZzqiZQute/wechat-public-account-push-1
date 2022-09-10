import execa from 'execa'
import fs from 'fs-extra'
import archiver from 'archiver'
import path from 'path'

function getAllDeps(p, paths) {
    let name
    let q = p
    if (q !== '.') {
        while (true) {
            name = path.join(q, 'package.json')
            if (fs.existsSync(name)) {
                break
            }
            const parts = q.split('node_modules/')
            parts.splice(parts.length - 2, 1)
            q = parts.join('node_modules/')
            if (!q) {
                break
            }
        }
    } else {
        name = path.join(q, 'package.json')
    }
    if (paths.indexOf(q) > -1) {
        return
    }
    if (q !== '.') {
        paths.push(q)
    }
    const pkg = JSON.parse(fs.readFileSync(name).toString())
    const deps = pkg.dependencies
    if (!deps) {
        return
    }
    Object.keys(deps).forEach((it) => {
        getAllDeps(path.join(p, 'node_modules', it), paths)
    })
}

;(async () => {
    console.log('正在构建腾讯云函数资源中，请耐心等待~')
    console.time('共用时')
    await fs.remove('build-tc')
    await execa('babel', ['config', '-d', 'build-tc/config'])
    await execa('babel', ['src', '-d', 'build-tc/src'])
    await execa('babel', ['main.js', '-o', 'build-tc/main.js'])
    await execa('babel', ['main-for-test.js', '-o', 'build-tc/main-for-test.js'])
    await fs.copy('package.json', 'build-tc/package.json')
    await fs.writeFile('build-tc/package.json', (await fs.readFile('build-tc/package.json')).toString().replace(/"type": "module"/, '"type": "commonjs"'))
    await execa('npm', ['i', '--no-save'])
    const deps = []
    getAllDeps('.', deps)
    for (const dep of deps) {
        await fs.copy(dep, `build-tc/${ dep }`)
        await execa('babel', [dep, '-d', `build-tc/${ dep }`])
    }
    await fs.writeFile('build-tc/index.js', `
require('core-js/full')
const execa = require('execa')

exports.main_handler = async function () {
    await execa('npm', ['run', 'dev'])
}
    `.trim())
    const output = fs.createWriteStream('./build-tc.zip')
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    })
    archive.pipe(output)
    archive.directory('build-tc/', false)
    await archive.finalize()
    // await fs.remove('build-tc')
    console.log('构建完成，请将生成的build-tc.zip上传到腾讯云~')
    console.timeEnd('共用时')
})()
