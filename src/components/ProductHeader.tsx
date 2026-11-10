import { useEffect } from "react"
import { PRODUCT } from "../product"

type ProductHeaderProps = {
  demo: boolean
}

export function ProductHeader({ demo }: ProductHeaderProps) {
  const name = PRODUCT.name || "[제품 이름]"
  const concept = PRODUCT.concept || "[제품 컨셉, 한 줄]"
  const description = PRODUCT.description || "[제품 설명, 2~3문장]"

  useEffect(() => {
    document.title = PRODUCT.name || "[제품 이름]"
  }, [])

  return (
    <header className="product-header">
      <h1 className={`t-display ${PRODUCT.name ? "" : "placeholder"}`}>
        {name}
      </h1>
      <p className={`t-label ${PRODUCT.concept ? "" : "placeholder"}`}>
        {concept}
      </p>
      <p
        className={`t-body description ${
          PRODUCT.description ? "" : "placeholder"
        }`}
      >
        {description}
      </p>
      {demo && <p className="t-caption demo-note">데모 데이터로 표시 중</p>}
    </header>
  )
}
