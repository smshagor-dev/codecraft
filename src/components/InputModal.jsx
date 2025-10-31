import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Text,
    Input,
    useColorMode,
    Alert,
    AlertIcon,
    AlertDescription,
    Badge,
    IconButton,
    Tooltip,
    Box,
    Code
  } from "@chakra-ui/react";
  import { FaPlay, FaTerminal, FaInfoCircle, FaCopy } from "react-icons/fa";
  import { useState, useEffect } from "react";
  
  export const InputModal = ({ 
    isOpen, 
    onClose, 
    onExecute, 
    language, 
    code, 
    isLoading,
    inputFields 
  }) => {
    const { colorMode } = useColorMode();
    const [inputValues, setInputValues] = useState([]);
  
    // Initialize input values when modal opens or inputFields change
    useEffect(() => {
      if (isOpen && inputFields && inputFields.length > 0) {
        setInputValues(inputFields.map(field => field.defaultValue || ''));
      }
    }, [isOpen, inputFields]);
  
    const handleInputChange = (index, value) => {
      const newInputs = [...inputValues];
      newInputs[index] = value;
      setInputValues(newInputs);
    };
  
    const handleExecute = () => {
      const inputString = inputValues.join('\n');
      onExecute(inputString);
      onClose();
    };
  
    const copyInputsToClipboard = () => {
      const inputsText = inputFields.map((field, index) => 
        `${field.prompt}: ${inputValues[index] || ''}`
      ).join('\n');
      
      navigator.clipboard.writeText(inputsText);
    };
  
    const getInputType = (field) => {
      if (field.type === 'number') return 'number';
      if (field.type === 'password') return 'password';
      return 'text';
    };
  
    if (!inputFields || inputFields.length === 0) return null;
  
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="lg" 
        closeOnOverlayClick={false}
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent 
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
          boxShadow="2xl"
        >
          <ModalHeader>
            <HStack spacing={3}>
              <Box
                p={2}
                bg="blue.500"
                borderRadius="md"
              >
                <FaTerminal size={16} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text>Program Input Required</Text>
                <HStack spacing={2}>
                  <Badge colorScheme="blue" fontSize="xs">
                    {language.toUpperCase()}
                  </Badge>
                  <Badge colorScheme="purple" fontSize="xs">
                    {inputFields.length} Input{inputFields.length > 1 ? 's' : ''}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md" fontSize="sm">
                <AlertIcon />
                <AlertDescription>
                  Your program requires user input. Please provide the values below:
                </AlertDescription>
              </Alert>
  
              {/* Code Preview */}
              <Box
                p={3}
                bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
                borderRadius="md"
                border="1px solid"
                borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
              >
                <Text fontSize="xs" fontWeight="bold" mb={2} color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                  CODE PREVIEW:
                </Text>
                <Code 
                  fontSize="xs" 
                  bg="transparent" 
                  color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}
                  p={0}
                  whiteSpace="pre-wrap"
                  maxH="100px"
                  overflowY="auto"
                >
                  {code.split('\n').slice(0, 10).join('\n')}
                  {code.split('\n').length > 10 ? '\n...' : ''}
                </Code>
              </Box>
  
              {/* Input Fields */}
              <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
                {inputFields.map((field, index) => (
                  <Box
                    key={index}
                    p={4}
                    bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
                  >
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          Input #{index + 1}
                        </Text>
                        <Badge 
                          colorScheme={field.type === 'password' ? 'red' : 'gray'} 
                          fontSize="xs"
                        >
                          {field.type || 'text'}
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                        {field.prompt}
                      </Text>
                      
                      <Input
                        value={inputValues[index] || ''}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.type || 'value'}`}
                        type={getInputType(field)}
                        size="md"
                        bg={colorMode === 'dark' ? 'gray.600' : 'white'}
                        borderColor={colorMode === 'dark' ? 'gray.500' : 'gray.300'}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px blue.500'
                        }}
                      />
                      
                      {field.example && (
                        <Text fontSize="xs" color="blue.500" fontStyle="italic">
                          Example: {field.example}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
  
              {/* Quick Actions */}
              <HStack spacing={2} justify="space-between" pt={2}>
                <Tooltip label="Copy all inputs to clipboard">
                  <IconButton
                    size="sm"
                    icon={<FaCopy />}
                    onClick={copyInputsToClipboard}
                    aria-label="Copy inputs"
                    variant="outline"
                  />
                </Tooltip>
                
                <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
                  Press Enter to submit, Esc to cancel
                </Text>
              </HStack>
            </VStack>
          </ModalBody>
  
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={onClose}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<FaPlay />}
                onClick={handleExecute}
                isLoading={isLoading}
                loadingText="Executing..."
                isDisabled={inputValues.some(val => val === '') && inputFields.some(field => field.required !== false)}
                size="md"
                px={6}
              >
                Run with Input
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };