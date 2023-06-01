use super::*;
use shopify_function::{run_function_with_input, Result};

#[test]
fn test_result_contains_no_discounts() -> Result<()> {
    let result = run_function_with_input(
        function,
        r#"
            {
                "discountNode": {
                    "metafield": null
                }
            }
        "#,
    )?;
    let expected = output::FunctionResult {
        discounts: vec![],
        discount_application_strategy: output::DiscountApplicationStrategy::FIRST,
    };

    assert_eq!(result, expected);
    Ok(())
}
