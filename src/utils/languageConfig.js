export const SUPPORTED_LANGUAGES = [
    { value: 'js', label: 'JavaScript (.js)', compiler: 'codex' },
    { value: 'jsx', label: 'React (.jsx)', compiler: 'browser' },
    { value: 'ts', label: 'TypeScript (.ts)', compiler: 'browser' },
    { value: 'tsx', label: 'React TypeScript (.tsx)', compiler: 'browser' },
    { value: 'vue', label: 'Vue (.vue)', compiler: 'browser' },
    { value: 'svelte', label: 'Svelte (.svelte)', compiler: 'browser' },
    { value: 'html', label: 'HTML (.html)', compiler: 'browser' },
    { value: 'css', label: 'CSS (.css)', compiler: 'browser' },
    { value: 'scss', label: 'SCSS (.scss)', compiler: 'browser' },
    { value: 'less', label: 'Less (.less)', compiler: 'browser' },
    { value: 'json', label: 'JSON (.json)', compiler: 'none' },
    { value: 'yaml', label: 'YAML (.yaml)', compiler: 'none' },
    { value: 'xml', label: 'XML (.xml)', compiler: 'none' },
    { value: 'md', label: 'Markdown (.md)', compiler: 'none' },
    { value: 'txt', label: 'Text (.txt)', compiler: 'none' },
    { value: 'py', label: 'Python (.py)', compiler: 'codex' },
    { value: 'java', label: 'Java (.java)', compiler: 'codex' },
    { value: 'cpp', label: 'C++ (.cpp)', compiler: 'codex' },
    { value: 'c', label: 'C (.c)', compiler: 'codex' },
    { value: 'php', label: 'PHP (.php)', compiler: 'codex' },
    { value: 'rb', label: 'Ruby (.rb)', compiler: 'codex' },
    { value: 'go', label: 'Go (.go)', compiler: 'codex' },
    { value: 'rs', label: 'Rust (.rs)', compiler: 'codex' },
    { value: 'swift', label: 'Swift (.swift)', compiler: 'codex' },
    { value: 'kt', label: 'Kotlin (.kt)', compiler: 'codex' },
    { value: 'dart', label: 'Dart (.dart)', compiler: 'codex' },
    { value: 'sql', label: 'SQL (.sql)', compiler: 'codex' },
    { value: 'graphql', label: 'GraphQL (.graphql)', compiler: 'none' },
    { value: 'sh', label: 'Shell Script (.sh)', compiler: 'codex' }
  ];
  
  export const getLanguageCompiler = (language) => {
    const langConfig = SUPPORTED_LANGUAGES.find(lang => lang.value === language);
    return langConfig?.compiler || 'codex';
  };