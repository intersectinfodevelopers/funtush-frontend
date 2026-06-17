
export default function ReviewStats({
    stats,
    ratingDistribution,
    trend,
}: any) {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white shadow rounded-xl p-4">
                    <h2 className="font-semibold mb-3 text-gray-700">
                        Rating Distribution
                    </h2>

                    {(ratingDistribution ?? []).map((r: any) => (
                        <div key={r.rating} className="flex items-center gap-2 text-gray-500">
                            <span className="w-10 text-sm">{r.rating}</span>

                            <div className="flex-1 bg-gray-200 h-2 rounded">
                                <div
                                    className="bg-yellow-400 h-2 rounded"
                                    style={{
                                        width: `${stats.total ? (r.count / stats.total) * 100 : 0}%`
                                    }}
                                />
                            </div>

                            <span className="text-xs">{r.count}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-white shadow rounded-xl p-4">
                    <h2 className="font-semibold mb-3 text-gray-700">
                        Review Trend
                    </h2>

                    <div className="flex items-end gap-2 h-32 text-gray-500">
                        {(trend ?? []).map((t: any) => (
                            <div key={t.month} className="flex flex-col items-center flex-1">
                                <div
                                    className="bg-blue-500 w-4 rounded"
                                    style={{ height: `${Math.max(t.count * 20, 4)}px` }}
                                />
                                <span className="text-xs mt-1">{t.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-gray-500">
                <div className="bg-white shadow rounded-xl p-4">
                    Total: {stats.total}
                </div>
                <div className="bg-white shadow rounded-xl p-4">
                    Avg: {stats.avg.toFixed(1)}
                </div>
                <div className="bg-white shadow rounded-xl p-4">
                    Five ★: {stats.fiveStar}
                </div>
            </div>
        </>
    );
}