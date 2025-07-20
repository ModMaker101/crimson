document.addEventListener('DOMContentLoaded', () => {
    const replInput = document.getElementById('repl-input');
    const replRunButton = document.getElementById('repl-run-button');
    const replOutput = document.getElementById('repl-output');

    // Simple storage for simulated variables and functions
    const simulatedEnvironment = {
        variables: {},
        functions: {}
    };

    function addOutputLine(text, type = '') {
        const line = document.createElement('div');
        line.classList.add('repl-output-line');
        if (type) {
            line.classList.add(type);
        }
        line.textContent = text;
        replOutput.appendChild(line);
        replOutput.scrollTop = replOutput.scrollHeight; // Auto-scroll to bottom
    }

    function simulateCrimsonExecution(code) {
        addOutputLine(`> ${code}`, 'input-echo'); // Echo the input

        // Trim whitespace and remove comments
        code = code.trim().replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

        if (!code) {
            return;
        }

        try {
            // --- Simulate 'print' statements ---
            const printRegex = /print\((["`'])(.*?)\1\);?/g;
            let match;
            while ((match = printRegex.exec(code)) !== null) {
                let printContent = match[2];
                // Simulate string interpolation: {variableName}
                printContent = printContent.replace(/\{(\w+)\}/g, (match, varName) => {
                    if (simulatedEnvironment.variables.hasOwnProperty(varName)) {
                        return simulatedEnvironment.variables[varName];
                    }
                    return `{${varName}}`; // Return original if variable not found
                });
                addOutputLine(printContent);
                return; // Only process the first print statement for simplicity
            }

            // --- Simulate 'var' declarations ---
            const varRegex = /var\s+(\w+)(:\s*\w+)?\s*=\s*(.+?);?$/;
            if (code.startsWith('var')) {
                const varMatch = code.match(varRegex);
                if (varMatch) {
                    const varName = varMatch[1];
                    const varValueStr = varMatch[3];
                    let varValue;

                    // Basic type simulation (number, string, boolean, null)
                    if (!isNaN(parseFloat(varValueStr)) && isFinite(varValueStr)) {
                        varValue = parseFloat(varValueStr);
                    } else if (varValueStr.startsWith('"') && varValueStr.endsWith('"') || varValueStr.startsWith("`") && varValueStr.endsWith("`") || varValueStr.startsWith("'") && varValueStr.endsWith("'")) {
                        varValue = varValueStr.substring(1, varValueStr.length - 1);
                    } else if (varValueStr === 'true') {
                        varValue = true;
                    } else if (varValueStr === 'false') {
                        varValue = false;
                    } else if (varValueStr === 'null') {
                        varValue = null;
                    } else if (simulatedEnvironment.variables.hasOwnProperty(varValueStr)) {
                        // Assigning from another variable
                        varValue = simulatedEnvironment.variables[varValueStr];
                    } else {
                        // Fallback for unhandled types or expressions
                        varValue = `[UNHANDLED_VALUE: ${varValueStr}]`;
                    }

                    simulatedEnvironment.variables[varName] = varValue;
                    addOutputLine(`Variable '${varName}' declared/assigned with value: ${varValue}`);
                    return;
                }
            }

            // --- Simulate basic assignments for existing variables ---
            const assignRegex = /(\w+)\s*=\s*(.+?);?$/;
            const assignMatch = code.match(assignRegex);
            if (assignMatch && simulatedEnvironment.variables.hasOwnProperty(assignMatch[1])) {
                const varName = assignMatch[1];
                const newValueStr = assignMatch[2];
                let newValue;

                if (!isNaN(parseFloat(newValueStr)) && isFinite(newValueStr)) {
                    newValue = parseFloat(newValueStr);
                } else if (newValueStr.startsWith('"') && newValueStr.endsWith('"') || newValueStr.startsWith("`") && newValueStr.endsWith("`") || newValueStr.startsWith("'") && newValueStr.endsWith("'")) {
                    newValue = newValueStr.substring(1, newValueStr.length - 1);
                } else if (newValueStr === 'true') {
                    newValue = true;
                } else if (newValueStr === 'false') {
                    newValue = false;
                } else if (newValueStr === 'null') {
                    newValue = null;
                } else if (simulatedEnvironment.variables.hasOwnProperty(newValueStr)) {
                    newValue = simulatedEnvironment.variables[newValueStr];
                } else {
                    newValue = `[UNHANDLED_VALUE: ${newValueStr}]`;
                }
                simulatedEnvironment.variables[varName] = newValue;
                addOutputLine(`Variable '${varName}' updated to: ${newValue}`);
                return;
            }

            // --- Simulate 'fn' (function) declarations ---
            const funcDeclRegex = /fn\s+(\w+)\((.*?)\)(:\s*\w+)?\s*\{([\s\S]*)\}/;
            const funcMatch = code.match(funcDeclRegex);
            if (funcMatch) {
                const funcName = funcMatch[1];
                const paramsStr = funcMatch[2];
                const funcBody = funcMatch[4].trim();

                const params = paramsStr.split(',').map(p => p.trim().split(':')[0].trim()).filter(p => p !== '');
                simulatedEnvironment.functions[funcName] = { params, body: funcBody };
                addOutputLine(`Function '${funcName}' defined.`);
                return;
            }

            // --- Simulate function calls (very basic, for 'greet' and 'main') ---
            const funcCallRegex = /(\w+)\((.*?)\);?$/;
            const funcCallMatch = code.match(funcCallRegex);
            if (funcCallMatch) {
                const calledFuncName = funcCallMatch[1];
                const argsStr = funcCallMatch[2];
                const args = argsStr.split(',').map(a => a.trim().replace(/^["']|["']$/g, '')); // Remove quotes

                if (simulatedEnvironment.functions[calledFuncName]) {
                    const funcDef = simulatedEnvironment.functions[calledFuncName];
                    // Very rudimentary execution: just process 'print' inside the function body
                    // This does NOT handle complex logic, loops, or conditionals inside functions.
                    if (funcDef.body.includes('print(')) {
                        let funcBodyProcessed = funcDef.body;
                        // Replace parameters in the body with actual arguments
                        funcDef.params.forEach((paramName, index) => {
                            const argValue = args[index] !== undefined ? args[index] : `[MISSING_ARG_${paramName}]`;
                            funcBodyProcessed = funcBodyProcessed.replace(new RegExp(`\\b${paramName}\\b`, 'g'), `"${argValue}"`); // Treat params as string literals for print
                        });

                        // Re-run print simulation for the processed body
                        const innerPrintRegex = /print\((["`'])(.*?)\1\);?/g;
                        let innerMatch;
                        while ((innerMatch = innerPrintRegex.exec(funcBodyProcessed)) !== null) {
                            let printContent = innerMatch[2];
                            printContent = printContent.replace(/\{(\w+)\}/g, (match, varName) => {
                                if (simulatedEnvironment.variables.hasOwnProperty(varName)) {
                                    return simulatedEnvironment.variables[varName];
                                }
                                return `{${varName}}`;
                            });
                            addOutputLine(`[${calledFuncName}] ${printContent}`);
                        }
                    } else if (calledFuncName === 'main' && funcDef.body) {
                        // Special handling for 'main' to execute its body sequentially
                        const lines = funcDef.body.split(';').map(line => line.trim()).filter(line => line);
                        lines.forEach(line => simulateCrimsonExecution(line + ';')); // Recursively call for each line
                    } else {
                        addOutputLine(`[${calledFuncName}] Function executed (no visible output).`);
                    }
                    return;
                }
            }


            // --- Simulate simple 'if' statements (very limited) ---
            const ifRegex = /if\s+(.*?)\s*\{([\s\S]*?)\}(?:\s*else\s*\{([\s\S]*?)\})?$/;
            const ifMatch = code.match(ifRegex);
            if (ifMatch) {
                const conditionStr = ifMatch[1].trim();
                const thenBlock = ifMatch[2].trim();
                const elseBlock = ifMatch[3] ? ifMatch[3].trim() : '';

                // Simple condition evaluation (only checks for direct variable comparison or boolean literals)
                let conditionMet = false;
                if (conditionStr === 'true') {
                    conditionMet = true;
                } else if (conditionStr === 'false') {
                    conditionMet = false;
                } else {
                    // Very basic variable comparison (e.g., "a > b")
                    const simpleComparisonRegex = /(\w+)\s*(==|!=|>|<|>=|<=)\s*(\w+|true|false|\d+|".*?"|`.*?`|'.*?'|null)/;
                    const comparisonMatch = conditionStr.match(simpleComparisonRegex);
                    if (comparisonMatch) {
                        const leftOperand = simulatedEnvironment.variables[comparisonMatch[1]] !== undefined ? simulatedEnvironment.variables[comparisonMatch[1]] : comparisonMatch[1];
                        const operator = comparisonMatch[2];
                        let rightOperand = simulatedEnvironment.variables[comparisonMatch[3]] !== undefined ? simulatedEnvironment.variables[comparisonMatch[3]] : comparisonMatch[3];

                        // Convert right operand to correct type if it's a literal string/number/boolean
                        if (!isNaN(parseFloat(rightOperand)) && isFinite(rightOperand)) {
                            rightOperand = parseFloat(rightOperand);
                        } else if (rightOperand.startsWith('"') && rightOperand.endsWith('"') || rightOperand.startsWith("`") && rightOperand.endsWith("`") || rightOperand.startsWith("'") && rightOperand.endsWith("'")) {
                            rightOperand = rightOperand.substring(1, rightOperand.length - 1);
                        } else if (rightOperand === 'true') {
                            rightOperand = true;
                        } else if (rightOperand === 'false') {
                            rightOperand = false;
                        } else if (rightOperand === 'null') {
                            rightOperand = null;
                        }

                        switch (operator) {
                            case '==': conditionMet = (leftOperand == rightOperand); break;
                            case '!=': conditionMet = (leftOperand != rightOperand); break;
                            case '>': conditionMet = (leftOperand > rightOperand); break;
                            case '<': conditionMet = (leftOperand < rightOperand); break;
                            case '>=': conditionMet = (leftOperand >= rightOperand); break;
                            case '<=': conditionMet = (leftOperand <= rightOperand); break;
                            default: addOutputLine(`Error: Unsupported comparison operator '${operator}' in REPL.`, 'error'); return;
                        }

                        // Handle 'and' and 'or' (extremely basic, only for simple A op B and C op D)
                        if (conditionStr.includes('and')) {
                            const parts = conditionStr.split('and').map(p => p.trim());
                            if (parts.length === 2) {
                                // This is a very simplified check, not a full parser
                                const originalCondition = conditionMet;
                                const secondPartEval = simulateCondition(parts[1]); // Recursive simplified evaluation
                                conditionMet = originalCondition && secondPartEval;
                            }
                        } else if (conditionStr.includes('or')) {
                            const parts = conditionStr.split('or').map(p => p.trim());
                            if (parts.length === 2) {
                                const originalCondition = conditionMet;
                                const secondPartEval = simulateCondition(parts[1]);
                                conditionMet = originalCondition || secondPartEval;
                            }
                        }

                    } else {
                        addOutputLine(`Warning: Complex condition "${conditionStr}" not fully supported in REPL simulation.`, 'error');
                        // For unsupported conditions, assume false to avoid infinite loops/unexpected behavior
                        conditionMet = false;
                    }
                }

                if (conditionMet) {
                    addOutputLine(`[IF] Condition "${conditionStr}" met. Executing then block.`);
                    thenBlock.split(';').map(line => line.trim()).filter(line => line).forEach(line => simulateCrimsonExecution(line + ';'));
                } else if (elseBlock) {
                    addOutputLine(`[IF] Condition "${conditionStr}" not met. Executing else block.`);
                    elseBlock.split(';').map(line => line.trim()).filter(line => line).forEach(line => simulateCrimsonExecution(line + ';'));
                } else {
                    addOutputLine(`[IF] Condition "${conditionStr}" not met (no else block).`);
                }
                return;
            }

            // Helper for very basic boolean condition parsing for 'and'/'or' within if statements
            function simulateCondition(condStr) {
                condStr = condStr.trim();
                if (condStr === 'true') return true;
                if (condStr === 'false') return false;

                const simpleComparisonRegex = /(\w+)\s*(==|!=|>|<|>=|<=)\s*(\w+|true|false|\d+|".*?"|`.*?`|'.*?'|null)/;
                const comparisonMatch = condStr.match(simpleComparisonRegex);
                if (comparisonMatch) {
                    const leftOperand = simulatedEnvironment.variables[comparisonMatch[1]] !== undefined ? simulatedEnvironment.variables[comparisonMatch[1]] : comparisonMatch[1];
                    const operator = comparisonMatch[2];
                    let rightOperand = simulatedEnvironment.variables[comparisonMatch[3]] !== undefined ? simulatedEnvironment.variables[comparisonMatch[3]] : comparisonMatch[3];

                    if (!isNaN(parseFloat(rightOperand)) && isFinite(rightOperand)) {
                        rightOperand = parseFloat(rightOperand);
                    } else if (rightOperand.startsWith('"') && rightOperand.endsWith('"') || rightOperand.startsWith("`") && rightOperand.endsWith("`") || rightOperand.startsWith("'") && rightOperand.endsWith("'")) {
                        rightOperand = rightOperand.substring(1, rightOperand.length - 1);
                    } else if (rightOperand === 'true') {
                        rightOperand = true;
                    } else if (rightOperand === 'false') {
                        rightOperand = false;
                    } else if (rightOperand === 'null') {
                        rightOperand = null;
                    }

                    switch (operator) {
                        case '==': return (leftOperand == rightOperand);
                        case '!=': return (leftOperand != rightOperand);
                        case '>': return (leftOperand > rightOperand);
                        case '<': return (leftOperand < rightOperand);
                        case '>=': return (leftOperand >= rightOperand);
                        case '<=': return (leftOperand <= rightOperand);
                        default: return false; // Fallback
                    }
                }
                return false;
            }


            // --- Simulate 'for' loops (very limited to simple `for (var i = 0; i < N; i = i + 1)`) ---
            const forLoopRegex = /for\s*\(\s*var\s+(\w+)\s*=\s*(\d+);\s*\w+\s*(<|<=)\s*(\d+);\s*\w+\s*=\s*\w+\s*\+\s*(\d+)\s*\)\s*\{([\s\S]*)\}/;
            const forMatch = code.match(forLoopRegex);
            if (forMatch) {
                const loopVarName = forMatch[1];
                let startVal = parseInt(forMatch[2]);
                const operator = forMatch[3];
                const endVal = parseInt(forMatch[4]);
                const increment = parseInt(forMatch[5]);
                const loopBody = forMatch[6].trim();

                let loopCount = 0;
                let currentVal = startVal;
                while (true) {
                    let conditionResult;
                    if (operator === '<') conditionResult = (currentVal < endVal);
                    else if (operator === '<=') conditionResult = (currentVal <= endVal);
                    else conditionResult = false; // Should not happen with current regex

                    if (!conditionResult || loopCount >= 100) { // Safety break for infinite loops
                        if (loopCount >= 100) addOutputLine(`Warning: Loop stopped after 100 iterations (possible infinite loop).`, 'error');
                        break;
                    }

                    addOutputLine(`[FOR] ${loopVarName} = ${currentVal}`);
                    // Simulate execution of each line in the loop body
                    loopBody.split(';').map(line => line.trim()).filter(line => line).forEach(line => {
                        // Temporarily set the loop variable for inner prints
                        const originalLoopVarValue = simulatedEnvironment.variables[loopVarName];
                        simulatedEnvironment.variables[loopVarName] = currentVal;
                        simulateCrimsonExecution(line + ';');
                        simulatedEnvironment.variables[loopVarName] = originalLoopVarValue; // Restore
                    });

                    currentVal += increment;
                    loopCount++;
                }
                addOutputLine(`[FOR] Loop finished.`);
                return;
            }


            // If no specific pattern matched, treat as unhandled or an expression to evaluate directly
            try {
                // Attempt to evaluate as a JavaScript expression for numbers/booleans/strings,
                // this is highly unreliable for complex Crimson syntax.
                let evaluatedResult = eval(code);
                if (evaluatedResult !== undefined) {
                    addOutputLine(`Result: ${evaluatedResult}`);
                } else {
                    addOutputLine(`No discernible output or side effect.`, 'error');
                }
            } catch (e) {
                addOutputLine(`Error: ${e.message}`, 'error');
                addOutputLine(`This REPL does not fully parse Crimson. Try 'print("...")' or 'var x = ...'`, 'error');
            }

        } catch (e) {
            addOutputLine(`REPL Internal Error: ${e.message}`, 'error');
        }
    }

    replRunButton.addEventListener('click', () => {
        const code = replInput.value;
        simulateCrimsonExecution(code);
        // replInput.value = ''; // Optionally clear input after running
    });

    replInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line in textarea
            replRunButton.click();
        }
    });
});