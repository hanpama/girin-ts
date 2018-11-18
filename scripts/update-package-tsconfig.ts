import * as fs from 'fs';
import * as path from 'path';


const PACKAGE_TSCONFIG = 'tsconfig.package.json';
const PROJECT_TSCONFIG = 'tsconfig.project.json';


const internalDependencyMap: Map<string, string[]> = new Map();
const packageDirnameMap: Map<string, string> = new Map();

const packagesRoot = path.join(__dirname, '..', 'packages');

const packagesNames: string[] = fs.readdirSync(packagesRoot).filter(
  item => (fs.lstatSync(path.join(packagesRoot, item)).isDirectory())
).map(packageDirname => {

  const packageJSONPath = path.join(packagesRoot, packageDirname, 'package.json');
  const packageJSONData = JSON.parse(fs.readFileSync(packageJSONPath).toString());
  const packageName = packageJSONData.name;

  const { dependencies, devDependencies } = packageJSONData;
  const internalDependencies = [
    ...(dependencies ? Object.keys(dependencies) : []),
    ...(devDependencies ? Object.keys(devDependencies) : []),
  ].filter(dep => dep.startsWith('@girin'));

  internalDependencyMap.set(packageName, internalDependencies);
  packageDirnameMap.set(packageName, packageDirname);

  return packageName;
});

function resolveInternalDependencies(dependencies: string[]): string[] {
  const childDeps = [];

  for (let idep of dependencies) {
    const deps = internalDependencyMap.get(idep)!;
    const res = resolveInternalDependencies(deps);
    for (let jdep of res) {
      childDeps.push(jdep);
    }
  }
  const resolved = childDeps.concat(dependencies);
  // remove all duplicated after the first appearance
  return resolved.filter((item, idx) => resolved.indexOf(item) === idx);
}


packagesNames.forEach(packageName => {
  const packageDirname = packageDirnameMap.get(packageName)!;
  const tsconfigPath = path.join(packagesRoot, packageDirname, PACKAGE_TSCONFIG);

  const internalDependencies = resolveInternalDependencies(
    internalDependencyMap.get(packageName)!
  );

  const tsconfigData = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      outDir: './lib',
      rootDir: './src',
      composite: true,
    },
    references: internalDependencies.map(dep => {
      const packageForderName = dep.split('/')[1];
      return { path: `../${packageForderName}/${PACKAGE_TSCONFIG}` };
    }),
    include: ['src'],
    exclude: ['tests'],
  };
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigData, null, '  '));
});

const projectLevelTsconfigPath = path.join(packagesRoot, PROJECT_TSCONFIG);

const projectLevelTsconfigData = {
  files: [],
  references: resolveInternalDependencies(packagesNames).map(
    packageName => ({ path: `./${packageDirnameMap.get(packageName)}/${PACKAGE_TSCONFIG}` })
  ),
};

console.log(projectLevelTsconfigPath, JSON.stringify(projectLevelTsconfigData, null, '  '));
fs.writeFileSync(projectLevelTsconfigPath, JSON.stringify(projectLevelTsconfigData, null, '  '));


// const testsTsconfigPath = path.join('tests', 'tsconfig.json');
// const testsTsconfigData = {
//   files: [],
//   extends: '../tsconfig.base.json',
//   references: resolveInternalDependencies(packagesNames).map(
//     packageName => ({ path: `../packages/${packageDirnameMap.get(packageName)}/tsconfig.json` })
//   ),
// };

// fs.writeFileSync(testsTsconfigPath, JSON.stringify(testsTsconfigData, null, '  '));