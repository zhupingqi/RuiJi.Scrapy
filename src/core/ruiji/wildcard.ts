export class Wildcard {
    constructor() {

    }

    static Match(pattern: string, input: string) {
        pattern = pattern.toLowerCase();
        input = input.toLowerCase();

        // if there are no wildcards, must be exact
        if (pattern.indexOf("*") === -1) {
            return pattern === input;
        }
        var patternSubstrings = pattern.split("*");

        var patternIndex = 0;
        var currentString = input;

        // find pattern beginning
        while (patternSubstrings[patternIndex] === '') {
            patternIndex++;
            // if the pattern is just wildcards, it matches
            if (patternIndex === pattern.length) {
                return true;
            }
        }

        if (patternIndex === 0 && input.indexOf(patternSubstrings[0]) !== 0) {
            // not starting with a wildcard
            return false;
        }

        var rollbackStrings = [];

        while (patternIndex < patternSubstrings.length) {
            if (currentString.indexOf(patternSubstrings[patternIndex]) === -1) {
                return Wildcard.CheckRollbackStrings(rollbackStrings, patternSubstrings);
            }

            // create a queue of strings to roll back and try again if we fail later
            var testString = currentString.substr(1);	//remove just one char to retest
            rollbackStrings.push({ string: testString, index: patternIndex });
            if (testString.indexOf(patternSubstrings[patternIndex]) === -1) {
                rollbackStrings.pop();
            }

            currentString = currentString.substr(
                currentString.indexOf(patternSubstrings[patternIndex]) + patternSubstrings[patternIndex].length
            );

            patternIndex++;
            while (patternSubstrings[patternIndex] === '') {
                patternIndex++;
            }
        }

        if (patternIndex >= patternSubstrings.length &&
            patternSubstrings[patternSubstrings.length - 1] !== '' &&
            currentString.length > 0) {
            // not ending with a wildcard, we need to backtrack
            if (currentString === input) { // this string doesn't even match a little
                return false;
            }

            return Wildcard.CheckRollbackStrings(rollbackStrings, patternSubstrings);
        }

        return true;
    }

    static CheckRollbackStrings(rollbackStrings: any[], patternSubstrings: any[]) {
        for (var s = 0; s < rollbackStrings.length; ++s) {
            var currentString = rollbackStrings[s].string;	// starting with the rolled back string
            var patternIndex = rollbackStrings[s].index;

            while (patternIndex < patternSubstrings.length) {
                if (currentString.indexOf(patternSubstrings[patternIndex]) === -1) {
                    break;
                }

                var testString = currentString.substr(1);	//remove just one char to retest
                rollbackStrings.push({ string: testString, index: patternIndex });
                if (testString.indexOf(patternSubstrings[patternIndex]) === -1) {
                    rollbackStrings.pop();
                }

                currentString = currentString.substr(
                    currentString.indexOf(patternSubstrings[patternIndex]) + patternSubstrings[patternIndex].length
                );

                patternIndex++;
                while (patternSubstrings[patternIndex] === '') {
                    patternIndex++;
                }

                if (patternIndex >= patternSubstrings.length) {
                    if (patternSubstrings[patternSubstrings.length - 1] !== '' &&
                        currentString.length > 0) {
                        // not ending with a wildcard, we need to backtrack
                        break;
                    }
                    else {
                        return true;
                    }
                }
            }
        }

        return false;
    }
};