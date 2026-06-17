export default function ReviewTable({ reviews, onSelect }: any) {
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-700 text-left text-white">
          <tr>
            <th className="p-3">Package</th>
            <th className="p-3">Trekker</th>
            <th className="p-3">Date</th>
            <th className="p-3">Rating</th>
            <th className="p-3">Review</th>
          </tr>
        </thead>

        <tbody className="text-gray-700">
          {reviews.map((r: any) => (
            <tr
              key={r.id}
              onClick={() => onSelect(r)}
              className="border-t cursor-pointer"
            >
              <td className="p-3">{r.package_id}</td>
              <td className="p-3">{r.trekker_id}</td>
              <td className="p-3">{r.date}</td>
              <td className="p-3 text-yellow-500">
                {"⭐".repeat(r.rating)}
              </td>
              <td className="p-3">
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs">{r.text}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}