const path = require('path');
const fs = require('fs');

module.exports = function (plop) {
  // ===============================
  // HELPERS
  // ===============================
  
  // Uppercase
  plop.setHelper('upper', txt => txt.toUpperCase());

  // PascalCase (Category, MyModule)
  plop.setHelper('pascal', txt => txt.replace(/(^\w|_\w)/g, m => m.replace('_','').toUpperCase()));
  
  // Plural (category -> categories, bus -> buses)
  plop.setHelper('plural', (txt) => {
    if (!txt) return '';
    if (txt.endsWith('y')) return txt.slice(0, -1) + 'ies';
    if (txt.endsWith('s')) return txt + 'es';
    return txt + 's';
  });

  // Equals
  plop.setHelper('eq', (a, b) => a === b); 

  // camelCasePlural
  plop.setHelper('camelCasePlural', (txt) => {
    if (!txt) return '';
    let plural = '';
    if (txt.endsWith('y')) {
      plural = txt.slice(0, -1) + 'ies';
    } else if (txt.endsWith('s')) {
      plural = txt + 'es';
    } else {
      plural = txt + 's';
    }
    return plural.charAt(0).toLowerCase() + plural.slice(1);
  });

  // ===============================
  // CUSTOM ACTION: parse fields
  // ===============================
  plop.setActionType('parseFields', (answers) => {
    const arr = (answers.fields || '').split(',').map(f => {
      const [name, type, length] = f.split(':');
      let tsType = 'string';
      let zodType = 'string';
      if (type === 'number') {
        tsType = 'number';
        zodType = 'number';
      } else if (type === 'boolean') {
        tsType = 'boolean';
        zodType = 'boolean';
      }
      return { name, type, tsType, zodType, length, required: true };
    });
    answers.fieldsArray = arr;
  });

  // ===============================
  // CUSTOM ACTION: update logger.ts
  // ===============================
  plop.setActionType("updateLogger", (answers) => {
    const filePath = path.join(process.cwd(), "src", "shared", "utils", "logger.ts");
    let content = fs.readFileSync(filePath, "utf-8");

    const insertPoint = "};"; // sebelum penutup objek Loggers
    const newLoggerLine = `  ${answers.name}: new Logger("${answers.name.toUpperCase()}"),`;

    if (content.includes(newLoggerLine)) {
      return `Logger for ${answers.name} already exists, skipped.`;
    }

    content = content.replace(insertPoint, `${newLoggerLine}\n${insertPoint}`);
    fs.writeFileSync(filePath, content, "utf-8");

    return `Logger for ${answers.name} added successfully!`;
  });

  // ===============================
  // CUSTOM ACTION: update response-code.ts
  // ===============================
  plop.setActionType("updateModule", (answers) => {
    const filePath = path.join(process.cwd(), "src", "shared", "constants", "response-code.ts");
    let content = fs.readFileSync(filePath, "utf-8");

    const moduleKey = answers.name.toUpperCase();
    const moduleValue = moduleKey.slice(0, 2); // Ambil 2 huruf pertama sebagai code

    const newModuleLine = `  ${moduleKey}: "${moduleValue}",`;

    if (content.includes(newModuleLine)) {
      return `Module ${moduleKey} already exists, skipped.`;
    }

    // Masukkan sebelum penutup objek MODULE
    content = content.replace(/} as const;/, `${newModuleLine}\n} as const;`);

    fs.writeFileSync(filePath, content, "utf-8");

    return `Module ${moduleKey} added successfully!`;
  });

  // ===============================
  // GENERATOR
  // ===============================
  plop.setGenerator('crud-module', {
    description: 'Generate CRUD module (controller, usecase, repository, types, entity, schema)',
    prompts: [
      {
        type: 'input',
        name: 'version',
        message: 'API version (ex: v1):',
        default: 'v1',
      },
      {
        type: 'input',
        name: 'name',
        message: 'Module name (singular, lowercase):',
        validate: (value) => {
          if (!value) return 'Module name is required';
          if (value.includes('/')) return 'Please enter only the module name without slash';
          return true;
        }
      },
      {
        type: 'input',
        name: 'fields',
        message: 'Fields (comma separated, format name:type:length, e.g. name:string:255,age:number):',
      },
    ],

    actions: [
      // Parse fields (custom action)
      { type: 'parseFields' },
      { type: 'updateLogger' },
      { type: 'updateModule' },

      // Controller
      {
        type: 'add',
        path: path.join(process.cwd(), 'src', 'modules', '{{version}}', '{{name}}', 'controllers', '{{name}}.controller.ts'),
        templateFile: 'plop-templates/controller.hbs',
      },

      // UseCase
      {
        type: 'add',
        path: path.join(process.cwd(), 'src', 'modules', '{{version}}', '{{name}}', 'usecases', '{{name}}.usecase.ts'),
        templateFile: 'plop-templates/usecase.hbs',
      },

      // Repository
      {
        type: 'add',
        path: path.join(process.cwd(), 'src', 'modules', '{{version}}', '{{name}}', 'repositories', '{{name}}.repository.ts'),
        templateFile: 'plop-templates/repository.hbs',
      },

      // Types
      {
        type: 'add',
        path: path.join(process.cwd(), 'src', 'modules', '{{version}}', '{{name}}', 'domains', '{{name}}.types.ts'),
        templateFile: 'plop-templates/types.hbs',
      },

      // Entity
      {
        type: 'add',
        path: path.join(process.cwd(), 'src', 'modules', '{{version}}', '{{name}}', 'domains', '{{name}}.entity.ts'),
        templateFile: 'plop-templates/entity.hbs',
      },

      // DTO
      {
        type: 'add',
        path: path.join(process.cwd(), 'src', 'modules', '{{version}}', '{{name}}', 'domains', '{{name}}.dto.ts'),
        templateFile: 'plop-templates/dto.hbs',
      },

      // Module
      {
        type: 'add',
        path: path.join(process.cwd(), 'src', 'modules', '{{version}}', '{{name}}', '{{name}}.module.ts'),
        templateFile: 'plop-templates/module.hbs',
      },

      // Schema
      {
        type: 'add',
        path: path.join(process.cwd(), 'src', 'core', 'db', 'schema', '{{name}}.schema.ts'),
        templateFile: 'plop-templates/schema.hbs',
      },
    ],
  });
};
