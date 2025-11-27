const ProductList = ({ data, title }: { data: any; title?: string }) => {
  return (
    <div className="my-10">
      <h2 className="mb-4 h2-bold">{title}</h2>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.map((product: any) => (
            <div key={product.id}>{product.name}</div>
          ))}
        </div>
      ) : (
        <div>
          <p>No Product Found</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
