import React, { useState } from 'react';
import { SafeRoute, EvacuationRoutesResponse } from '../types/hazard';
import { Route, Clock, MapPin, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface SafeRoutesCardProps {
  evacuationRoutes: EvacuationRoutesResponse;
  className?: string;
}

const SafeRoutesCard: React.FC<SafeRoutesCardProps> = ({ evacuationRoutes, className = '' }) => {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const toggleRouteExpansion = (routeId: string) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Route className="w-5 h-5 mr-2" />
          Safe Evacuation Routes
        </h3>
        <div className="text-sm text-gray-600">
          {evacuationRoutes.availableRoutes} routes available
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">{evacuationRoutes.routes.length}</div>
          <div className="text-sm text-gray-600">Routes</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600">{evacuationRoutes.hazardCount}</div>
          <div className="text-sm text-gray-600">Hazards Avoided</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {evacuationRoutes.routes.filter(r => r.hazardAvoided).length}
          </div>
          <div className="text-sm text-gray-600">Safe Routes</div>
        </div>
      </div>

      <div className="space-y-3">
        {evacuationRoutes.routes.map((route) => (
          <div key={route.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${route.hazardAvoided ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <div className="font-medium text-gray-900">Route {route.id.split('-')[1]}</div>
                  <div className="text-sm text-gray-600">
                    {formatDistance(route.distance)} • {formatTime(route.estimatedTime)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {route.hazardAvoided && (
                  <Shield className="w-4 h-4 text-green-600" />
                )}
                <button
                  onClick={() => toggleRouteExpansion(route.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expandedRoute === route.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expandedRoute === route.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium">Origin</div>
                      <div className="text-gray-600">
                        {route.origin[0].toFixed(4)}, {route.origin[1].toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium">Destination</div>
                      <div className="text-gray-600">
                        {route.destination[0].toFixed(4)}, {route.destination[1].toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Route className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Distance: {formatDistance(route.distance)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>ETA: {formatTime(route.estimatedTime)}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Shield className={`w-4 h-4 mr-2 ${route.hazardAvoided ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-sm ${route.hazardAvoided ? 'text-green-600' : 'text-red-600'}`}>
                    {route.hazardAvoided ? 'Hazards avoided' : 'May encounter hazards'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Generated: {new Date(evacuationRoutes.generatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default SafeRoutesCard; 