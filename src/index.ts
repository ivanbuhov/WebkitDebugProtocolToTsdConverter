import * as fs from 'fs';
import * as path from 'path';
import * as ts from './TypeScriptAst';
import * as wp from './WebkitProtocolDescription';
import {AstGenerator} from './AstGenerator';
import * as ser from './AstSerializer';

interface ProgramArgs {
    inputDir: string,
    namespace: string,
    out: string,
    commandResultTemplate: string
}

class Program {
    static main(): any {
        let args: ProgramArgs = require(process.argv[2]);

        let astGenerator: AstGenerator = new AstGenerator(args.commandResultTemplate);
        let fileStream: fs.WriteStream = fs.createWriteStream(args.out);
        let astSerializer = new ser.AstSerializer(fileStream);
        
        // read all files from the input folder
        fs.readdir(args.inputDir, (err, files) => {
            let rootNamespace: ts.Namespace = new ts.Namespace(args.namespace, true, 'Root namespace holding all Webkit protocol related interfaces.');
            files.forEach(file => {
                let domainNamespace: ts.Namespace = astGenerator.convertDomain(<wp.Domain>require(path.resolve(args.inputDir, file)));
                rootNamespace.namespaces.push(domainNamespace);
                console.log(`${file} loaded.`);
            });
            console.log('Done!');
            astSerializer.writeNamespace(rootNamespace, new ser.SerializationContext());
            fileStream.end();
        });
    }
}

Program.main();