contract Example {
  uint public test_value;
  function Example() {
    // constructor
  }
  function set(uint new_value) {
    test_value = new_value;
  }
}
