import * as fs from 'fs';
import * as path from 'path';
import * as ts from './TypeScriptAst';
import * as wp from './WebkitProtocolDescription';
import {AstGenerator} from './AstGenerator';
import * as ser from './AstSerializer';

class Program {
    static main(): any {
        let args: { inputDir: string, namespace: string, out: string } = this.parseProcessArgs();
        
        let astGenerator: AstGenerator = new AstGenerator();
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
    
    public static parseProcessArgs(): any {
        var processArgs = process.argv.slice(2);
        var args = { inputDir: './protocol', namespace: 'Webkit', out: './webkit-generated.d.ts' };
        
        for(var i = 0; i < processArgs.length; i++) {
            if (processArgs[i][0] == '-' && processArgs[i][1] == '-' && i + 1 < processArgs.length) {
                args[processArgs[i].substr(2)] = processArgs[i + 1];
            }
        }
    
        return args;
    }
}

Program.main();